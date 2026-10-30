import { defineEndpoint, UsageModelKind } from "@shared/core";
import { z } from "zod";

/**
 * `GET /v1beta/files/{file}:download?alt=media` - the Files API reader for
 * a video an Omni run delivered by uri. The download needs the API key,
 * so the Omni endpoints hand back the file id and this endpoint fetches
 * it. A redirect to a signed storage URL is returned as `{url}`; bytes
 * come back as `{contentType, base64}`.
 */
export default defineEndpoint({
    meta: {
        displayName: "Download Generated Video",
        summary: "Download a video an Omni Flash run stored in the Files API.",
        description: "Fetch the MP4 a Gemini Omni Flash run delivered by " +
            "uri, by the `video.file` id in that run's result. Returns " +
            "the bytes base64-encoded as `{contentType, base64}`, or a " +
            "signed `url` when Google answers with a redirect. Free; " +
            "files expire 48 hours after generation.",
        docsUrl: "https://ai.google.dev/gemini-api/docs/files",
    },
    endpoint: "/v1beta/files/{file}/download",
    request: { method: "GET", path: "/v1beta/files/{file}:download" },
    input: {
        schema: {
            pathParams: z.object({
                file: z
                    .string()
                    .regex(/^[a-z0-9-]+$/, "a Files API id")
                    .describe(
                        "The Files API id, `video.file` in an Omni result " +
                            "(the segment after /files/ in its uri).",
                    ),
            }).strict(),
        },
    },
    timeouts: { requestMs: 120_000, runMs: 150_000 },
    lifecycle: {
        start: async ({ utils }) => {
            const res = await utils.request({
                queryParams: { alt: "media" },
            });
            const location = res.headers.location;
            if (res.status >= 300 && res.status < 400 && location) {
                return {
                    kind: "COMPLETED",
                    httpStatus: 200,
                    providerHttpStatus: res.status,
                    output: { url: location },
                };
            }
            return {
                kind: "COMPLETED",
                httpStatus: res.status,
                output: res.body,
            };
        },
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
