import { z } from "zod";
import { defineEndpoint } from "@shared/core";
import { zCommand, zMachinePath, zRunContext } from "../../schema/common.ts";

/**
 * `POST /v1/machines/{id}/jobs` - a detached command as an ASYNC RUN:
 * start submits the job, poll reads `GET .../jobs/{job_id}` until it is
 * `exited` or `lost`, then collects stdout and stderr from
 * `GET .../jobs/{job_id}/output`; stopping the run cancels the job. The
 * job URL is the submit URL plus the job id, read from `data.request.url`.
 */
export const zJobBody = z.object({
    command: zCommand,
    ...zRunContext,
    timeoutSeconds: z.number().int().min(1).describe(
        "Stop the job with SIGTERM after this many seconds (exitCode 143).",
    ).optional(),
}).strict();

export default defineEndpoint({
    meta: {
        displayName: "Run Command (long-running)",
        summary:
            "Run a long command inside a machine you own; the run completes with its output.",
        description: "Run a command that takes longer than a moment - a " +
            "build, a dependency install, a test suite - as a detached " +
            "job. The run stays RUNNING while the job does and completes " +
            "with the job record (state, exitCode, finishedAt) plus its " +
            "stdout and stderr; stop the run to cancel the job. Default " +
            "900 s, max 3600 s. Auto-starts a stopped machine and LEAVES " +
            "IT RUNNING. For a quick command use /machines/{id}/exec.",
        docsUrl: "https://smolmachines.com/docs/guides/agent-sandboxes-ci",
        categories: ["virtual-machines"],
        notes: [
            "Command failure is data: check exitCode (143 = cancelled or " +
            "timed out). state `lost` means the machine stopped or " +
            "restarted while the job ran.",
            "stdout and stderr are returned up to 1 MiB each; " +
            "stdoutTruncated/stderrTruncated say when more was written.",
        ],
    },
    endpoint: "/machines/{id}/exec/async",
    request: { method: "POST", path: "/v1/machines/{id}/jobs" },
    input: {
        schema: {
            pathParams: zMachinePath,
            body: zJobBody.extend({
                timeoutSeconds: zJobBody.shape.timeoutSeconds.unwrap().max(
                    3600,
                ).default(900),
            }),
        },
    },
    timeouts: { requestMs: 30_000, pollMs: 5_000, runMs: 3_720_000 },
    resources: {
        uses: [{ id: "smolmachine/machine", key: "$.pathParams.id" }],
    },
    lifecycle: {
        start: async ({ utils }) => {
            const res = await utils.request();
            if (res.status < 200 || res.status >= 300) {
                return {
                    kind: "COMPLETED",
                    httpStatus: res.status,
                    output: res.body,
                };
            }
            const jobId = utils.json.optionalStr(res.body, "$.id");
            if (jobId === undefined || jobId === "") {
                throw new Error("smolmachine did not return a job id");
            }
            return { kind: "RUNNING", state: { externalRunId: jobId } };
        },
        poll: async ({ data, utils }) => {
            const $ = utils.json;
            const jobId = data.lifecycle.state.externalRunId;
            if (jobId === undefined) {
                throw Object.assign(
                    new Error("smolmachine poll without a job id in state"),
                    { retriable: false },
                );
            }
            const jobUrl = data.request.url + "/" + encodeURIComponent(jobId);
            const res = await utils.http({ method: "GET", url: jobUrl });
            if (res.status === 429 || res.status >= 500) {
                // the status LOOKUP failed, not the job - keep polling
                return { kind: "RUNNING", pollAfterMs: 15_000 };
            }
            if (res.status < 200 || res.status >= 300) {
                return {
                    kind: "COMPLETED",
                    httpStatus: res.status,
                    output: res.body,
                };
            }
            if ($.optionalStr(res.body, "$.state") === "running") {
                return { kind: "RUNNING" };
            }
            const streams = [];
            for (const stream of ["stdout", "stderr"]) {
                const out = await utils.http({
                    method: "GET",
                    url: jobUrl + "/output",
                    queryParams: { stream, limit: "1048576" },
                });
                streams.push(
                    out.status >= 200 && out.status < 300
                        ? {
                            data: $.optionalStr(out.body, "$.data") ?? "",
                            truncated: $.optionalGet(out.body, "$.eof") !==
                                true,
                        }
                        : { data: "", truncated: true },
                );
            }
            return {
                kind: "COMPLETED",
                httpStatus: 200,
                output: $.merge(res.body, {
                    stdout: streams[0].data,
                    stdoutTruncated: streams[0].truncated,
                    stderr: streams[1].data,
                    stderrTruncated: streams[1].truncated,
                }),
            };
        },
        stop: async ({ data, utils, logger }) => {
            const jobId = data.lifecycle.state.externalRunId;
            if (jobId === undefined) return;
            const res = await utils.http({
                method: "POST",
                url: data.request.url + "/" + encodeURIComponent(jobId) +
                    "/cancel",
            });
            if (res.status < 200 || res.status >= 300) {
                // an already-finished job has nothing left to cancel
                logger.warn("smolmachine job cancel failed (ignored)", {
                    jobId,
                    status: res.status,
                });
            }
        },
    },
});
