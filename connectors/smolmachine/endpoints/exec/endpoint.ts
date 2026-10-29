import { z } from "zod";
import { defineEndpoint } from "@shared/core";
import { zCommand, zMachinePath, zRunContext } from "../../schema/common.ts";

/**
 * `POST /v1/machines/{id}/exec` - a buffered command run, output inline.
 * `stream` (an SSE body) is not accepted: the run returns one JSON result.
 * `timeoutSeconds` is capped at 25 so the command finishes inside the
 * 30 s request budget; longer work goes to /machines/{id}/exec/async.
 */
export const zExecBody = z.object({
    command: zCommand,
    ...zRunContext,
    stdin: z.string().optional().describe(
        "Text piped to the command's standard input - JSON, source code or " +
            "another small payload.",
    ),
    background: z.boolean().optional().describe(
        "Spawn the command detached and return its PID at once (for " +
            "daemons such as a dev server).",
    ),
    timeoutSeconds: z.number().int().min(1).describe(
        "Kill the command after this many seconds (exitCode 124).",
    ).optional(),
}).strict();

export default defineEndpoint({
    meta: {
        displayName: "Run Command",
        summary:
            "Run a short command inside a machine you own and get the output back inline.",
        description: "Run a command (argv array or shell string) inside " +
            "your machine and get stdout, stderr, exitCode and durationMs " +
            "back in the same call. Auto-starts a stopped machine and " +
            "LEAVES IT RUNNING, so a command may start a server or a " +
            "background job that outlives the call. Capped at 25 s - use " +
            "/machines/{id}/exec/async for builds, installs or test " +
            "suites.",
        docsUrl: "https://smolmachines.com/docs/cloud",
        categories: ["virtual-machines"],
        notes: [
            "stdout/stderr are lossy UTF-8 and capped (see " +
            "stdoutTruncated); stdoutB64/stderrB64 are byte-exact.",
        ],
    },
    endpoint: "/machines/{id}/exec",
    request: { method: "POST", path: "/v1/machines/{id}/exec" },
    input: {
        schema: {
            pathParams: zMachinePath,
            body: zExecBody.extend({
                timeoutSeconds: zExecBody.shape.timeoutSeconds.unwrap().max(25)
                    .default(25),
            }),
        },
    },
    resources: {
        uses: [{ id: "smolmachine/machine", key: "$.pathParams.id" }],
    },
});
