import { z } from "zod";
import { defineEndpoint } from "@shared/core";
import { zMachinePath, zRunContext } from "../../schema/common.ts";

/**
 * `POST /v1/machines/{id}/code` - run a source snippet with the matching
 * interpreter. `timeoutSeconds` is capped at 25 (the 30 s request budget).
 */
export const zCodeBody = z.object({
    language: z.string().min(1).describe(
        'The snippet\'s language, e.g. "python" or "javascript". The ' +
            "interpreter must exist in the machine's image.",
    ),
    code: z.string().min(1).describe("The source to run."),
    ...zRunContext,
    timeoutSeconds: z.number().int().min(1).describe(
        "Kill the run after this many seconds (exitCode 124).",
    ).optional(),
}).strict();

export default defineEndpoint({
    meta: {
        displayName: "Run Code",
        summary:
            "Run a source snippet in a machine you own - no shell quoting.",
        description: "Run source code directly (`language` + `code`) " +
            "instead of building a shell command, and get stdout, stderr " +
            "and exitCode back inline. The interpreter must already be in " +
            "the image: a python:* image for python, a node:* image for " +
            "javascript. Auto-starts a stopped machine and LEAVES IT " +
            "RUNNING. Capped at 25 s.",
        docsUrl: "https://smolmachines.com/docs/guides/python",
        categories: ["virtual-machines"],
        notes: [
            "exitCode 255 with a 'not found in $PATH' stderr means the " +
            "image has no such runtime.",
        ],
    },
    endpoint: "/machines/{id}/code",
    request: { method: "POST", path: "/v1/machines/{id}/code" },
    input: {
        schema: {
            pathParams: zMachinePath,
            body: zCodeBody.extend({
                timeoutSeconds: zCodeBody.shape.timeoutSeconds.unwrap().max(25)
                    .default(25),
            }),
        },
    },
    resources: {
        uses: [{ id: "smolmachine/machine", key: "$.pathParams.id" }],
    },
});
