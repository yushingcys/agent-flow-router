import { z } from "zod";
import { defineEndpoint, type Json } from "@shared/core";
import { zGuestPath, zMachinePath } from "../../schema/common.ts";

/**
 * Write a file into a machine. smol's own route,
 * `PUT /v1/machines/{id}/files/{path}`, takes the RAW file bytes as the
 * request body, which the engine transport cannot send (it encodes JSON
 * or multipart). So the write rides smol's exec route instead: the bytes
 * travel base64 on `stdin` and the guest's `base64 -d` writes them, which
 * is binary-exact. A `file_url` is fetched by the engine (no credentials
 * leave for a foreign host) and written the same way.
 *
 * ponytail: exec-based write needs `sh` + `base64` in the image (busybox
 * and coreutils both have them) and fits the 25 s exec budget; a raw-bytes
 * request encoding in the engine would let this use the PUT route.
 */
export const zUploadBody = z.object({
    path: zGuestPath,
    content_base64: z.string().regex(/^[A-Za-z0-9+/]*={0,2}$/).describe(
        "The file's bytes, base64-encoded. For small files.",
    ).optional(),
    file_url: z.url({ protocol: /^https$/ }).describe(
        "A public https URL to fetch the file from instead.",
    ).optional(),
}).strict();

export default defineEndpoint({
    meta: {
        displayName: "Upload File",
        summary:
            "Upload a file into a machine you own, inline (base64) or from a URL.",
        description: "Write a file into your machine's filesystem at the " +
            "given absolute guest path, creating parent directories. Small " +
            "files ride inline as `content_base64`; otherwise pass a public " +
            "https `file_url` to fetch. Anything on the machine disk " +
            "(/workspace, the image filesystem) survives stop/start; /tmp, " +
            "/run and /dev/shm are memory-backed and empty after a stop. " +
            "Auto-starts a stopped machine.",
        docsUrl: "https://smolmachines.com/docs/cloud",
        categories: ["virtual-machines"],
        notes: [
            "Pass exactly one of `content_base64` or `file_url`.",
            "The image needs `sh` and `base64` (any busybox or coreutils " +
            "image); a distroless image cannot take uploads this way.",
        ],
    },
    endpoint: "/machines/{id}/files/upload",
    request: { method: "POST", path: "/v1/machines/{id}/exec" },
    input: { schema: { pathParams: zMachinePath, body: zUploadBody } },
    resources: {
        uses: [{ id: "smolmachine/machine", key: "$.pathParams.id" }],
    },
    lifecycle: {
        start: async ({ data, utils }) => {
            const body = data.input.body!;
            const fail = (status: number, detail: string) => ({
                kind: "COMPLETED" as const,
                httpStatus: status,
                output: { code: "upload_failed", detail } as Json,
            });
            if (
                (body.content_base64 === undefined) ===
                    (body.file_url === undefined)
            ) {
                return fail(
                    400,
                    "pass exactly one of content_base64 or file_url",
                );
            }
            let base64 = body.content_base64;
            let text: string | undefined;
            if (body.file_url !== undefined) {
                const got = await utils.http({
                    method: "GET",
                    url: body.file_url,
                });
                if (got.status < 200 || got.status >= 300) {
                    return fail(
                        422,
                        "file_url answered HTTP " + got.status,
                    );
                }
                const fetched = got.body;
                if (
                    fetched !== null && typeof fetched === "object" &&
                    !Array.isArray(fetched) &&
                    typeof fetched.base64 === "string" &&
                    typeof fetched.contentType === "string"
                ) {
                    base64 = fetched.base64;
                } else {
                    // a text body arrives decoded (JSON re-serialized)
                    text = typeof fetched === "string"
                        ? fetched
                        : fetched === null
                        ? ""
                        : JSON.stringify(fetched);
                }
            }
            const write = text === undefined
                ? 'mkdir -p "$(dirname "$1")" && base64 -d > "$1" && wc -c < "$1"'
                : 'mkdir -p "$(dirname "$1")" && cat > "$1" && wc -c < "$1"';
            const res = await utils.http({
                method: "POST",
                url: data.request.url,
                body: {
                    command: ["sh", "-c", write, "sh", body.path],
                    stdin: text ?? base64 ?? "",
                    timeoutSeconds: 25,
                },
            });
            if (res.status < 200 || res.status >= 300) {
                return {
                    kind: "COMPLETED",
                    httpStatus: res.status,
                    output: res.body,
                };
            }
            const $ = utils.json;
            const exitCode = $.optionalNum(res.body, "$.exitCode");
            if (exitCode !== 0) {
                return fail(
                    422,
                    "writing " + body.path + " failed (exitCode " +
                        String(exitCode) + "): " +
                        ($.optionalStr(res.body, "$.stderr") ?? ""),
                );
            }
            return {
                kind: "COMPLETED",
                httpStatus: 200,
                output: {
                    machineId: data.input.pathParams!.id as string,
                    path: body.path,
                    size: Number(
                        ($.optionalStr(res.body, "$.stdout") ?? "").trim(),
                    ),
                },
            };
        },
    },
});
