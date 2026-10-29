import { z } from "zod";
import { defineEndpoint, type Json } from "@shared/core";
import { zGuestPath, zMachinePath } from "../../schema/common.ts";

/**
 * `GET /v1/machines/{id}/files/{path}` - read a guest file. The guest path
 * is a route SUFFIX relative to the guest root (`/workspace/app.txt` is
 * `.../files/workspace/app.txt`), each segment percent-encoded on its own
 * so the slashes stay route separators. Bytes come back as base64.
 */
export default defineEndpoint({
    meta: {
        displayName: "Download File",
        summary: "Download a file from a machine you own.",
        description: "Read a file from your machine's filesystem at the " +
            "given absolute guest path. The file comes back inline as " +
            "`content_base64` (byte-exact) with its `contentType`. Use it " +
            "to pull build artifacts, results or logs a command wrote to " +
            "/workspace.",
        docsUrl: "https://smolmachines.com/docs/cloud",
        categories: ["virtual-machines"],
    },
    endpoint: "/machines/{id}/files/download",
    request: { method: "GET", path: "/v1/machines/{id}/files" },
    input: {
        schema: {
            pathParams: zMachinePath,
            queryParams: z.object({ path: zGuestPath }).strict(),
        },
    },
    resources: {
        uses: [{ id: "smolmachine/machine", key: "$.pathParams.id" }],
    },
    lifecycle: {
        start: async ({ data, utils }) => {
            const path = String(
                (data.input.queryParams as Record<string, unknown>).path,
            );
            const res = await utils.http({
                method: "GET",
                url: data.request.url + "/" +
                    path.split("/").filter((s) => s !== "").map((s) =>
                        encodeURIComponent(s)
                    ).join("/"),
            });
            if (res.status < 200 || res.status >= 300) {
                return {
                    kind: "COMPLETED",
                    httpStatus: res.status,
                    output: res.body,
                };
            }
            const got = res.body;
            const binary = got !== null && typeof got === "object" &&
                !Array.isArray(got) && typeof got.base64 === "string";
            return {
                kind: "COMPLETED",
                httpStatus: 200,
                output: (binary
                    ? {
                        path,
                        contentType: utils.json.optionalStr(
                            got,
                            "$.contentType",
                        ) ?? "application/octet-stream",
                        content_base64: utils.json.optionalStr(
                            got,
                            "$.base64",
                        ) ?? "",
                    }
                    : {
                        // a text body arrives decoded (JSON re-serialized)
                        path,
                        content: typeof got === "string"
                            ? got
                            : got === null
                            ? ""
                            : JSON.stringify(got),
                    }) as Json,
            };
        },
    },
});
