import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { AGENT_BASE_URL } from "../../schema/common.ts";
import { zAutomationRunBody } from "./schema/inputs.ts";

/**
 * TinyFish Agent - an AI browser agent run from a natural-language goal.
 *
 * Runs through the ASYNC protocol (`POST /v1/automation/run-async` -> poll
 * `GET /v1/runs/{id}` -> `POST /v1/runs/{id}/cancel`): the synchronous
 * `/v1/automation/run` cannot be cancelled, and a run that keeps stepping
 * keeps billing.
 *
 * BILLING: $0.016 per agent step (https://www.tinyfish.ai/pricing, checked
 * 2026-10-27); the finished run reports `num_of_steps`. The estimate
 * promises `agent_config.max_steps`, else the vendor's documented default
 * cap of 150 - the one place a constant stands in for a caller knob,
 * because TinyFish answers 403 to `max_steps` on accounts without its beta,
 * so the knob can be neither required nor materialized.
 */
export default defineEndpoint({
    meta: {
        displayName: "TinyFish Browser Agent",
        summary: "Run an AI browser agent on any website from a goal.",
        description: "Run an AI browser agent against any website from a " +
            "natural-language 'goal': it opens 'url' in a real browser, " +
            "navigates, clicks, types, and extracts, then returns " +
            "'result' (optionally shaped by 'output_schema'). Billed per " +
            "agent step; 'agent_config.max_steps' bounds the cost (the " +
            "run stops at the cap and returns partial results) and " +
            "'agent_config.max_duration_seconds' adds a soft wall-clock " +
            "budget. For protected sites use browser_profile 'stealth' " +
            "with 'proxy_config'. For logged-in sites, provision a " +
            "Browser Context Profile (/browser-profiles/provision), save a " +
            "login through its setup session, then pass 'use_profile' and " +
            "'profile_id'. A COMPLETED status means the browser ran - read " +
            "'result' to see whether the goal was achieved.",
        docsUrl: "https://docs.tinyfish.ai/agent-api/reference",
        categories: ["agents", "web-scraping"],
        notes: [
            "Without the max_steps beta the run is capped at the vendor " +
            "default of 150 steps, and that cap is what the estimate holds.",
        ],
    },
    endpoint: "/automation/run",
    request: {
        method: "POST",
        path: "/v1/automation/run-async",
        baseUrl: AGENT_BASE_URL,
    },
    input: { schema: { body: zAutomationRunBody } },
    timeouts: { requestMs: 30_000, runMs: 1_200_000, pollMs: 5_000 },
    lifecycle: {
        start: async ({ data, utils, logger }) => {
            logger.info("starting tinyfish agent run", {
                url: data.request.url,
            });
            const res = await utils.request();
            if (res.status < 200 || res.status >= 300) {
                // 400 bad input, 402 wallet empty, 403 beta-gated knob,
                // 429 rate limit - DATA, zero-billed by the engine.
                return {
                    kind: "COMPLETED",
                    httpStatus: res.status,
                    output: res.body,
                };
            }
            const runId = utils.json.optionalGet(res.body, "$.run_id");
            if (typeof runId !== "string" || runId === "") {
                // a 200 with `error` set and no run: the run was refused
                // before it started (nothing to poll, nothing billed)
                return {
                    kind: "COMPLETED",
                    httpStatus: 400,
                    providerHttpStatus: res.status,
                    output: res.body,
                };
            }
            return { kind: "RUNNING", state: { externalRunId: runId } };
        },
        poll: async ({ data, utils, logger }) => {
            const runId = data.lifecycle.state.externalRunId;
            if (runId === undefined) {
                throw Object.assign(
                    new Error("tinyfish poll without externalRunId in state"),
                    { retriable: false },
                );
            }
            const url = data.request.url;
            const res = await utils.http({
                method: "GET",
                url: url.slice(0, url.indexOf("/v1/")) + "/v1/runs/" +
                    encodeURIComponent(runId),
            });
            if (res.status === 429 || res.status >= 500) {
                // the status READ failed, not the run - it keeps stepping
                // (and billing) upstream, so keep watching it
                logger.warn("tinyfish run lookup transient", {
                    runId,
                    status: res.status,
                });
                return { kind: "RUNNING", pollAfterMs: 15_000 };
            }
            if (res.status < 200 || res.status >= 300) {
                return {
                    kind: "COMPLETED",
                    httpStatus: res.status,
                    output: res.body,
                };
            }
            const status = utils.json.optionalGet(res.body, "$.status");
            if (status === "PENDING" || status === "RUNNING") {
                return { kind: "RUNNING" };
            }
            if (status !== "COMPLETED") {
                // FAILED / CANCELLED: an OURS-synthesized error status over
                // the vendor's 200 (design D12), the run record intact
                logger.warn("tinyfish run did not complete", {
                    runId,
                    status: String(status),
                });
                return {
                    kind: "COMPLETED",
                    httpStatus: 500,
                    providerHttpStatus: 200,
                    output: res.body,
                };
            }
            return { kind: "COMPLETED", httpStatus: 200, output: res.body };
        },
        stop: async ({ data, utils, logger }) => {
            const runId = data.lifecycle.state.externalRunId;
            if (runId === undefined) {
                throw Object.assign(
                    new Error("tinyfish stop without externalRunId in state"),
                    { retriable: false },
                );
            }
            const url = data.request.url;
            const res = await utils.http({
                method: "POST",
                url: url.slice(0, url.indexOf("/v1/")) + "/v1/runs/" +
                    encodeURIComponent(runId) + "/cancel",
            });
            if (res.status < 200 || res.status >= 300) {
                // idempotent upstream; a finished run has nothing to stop
                logger.warn("tinyfish run cancel failed (ignored)", {
                    runId,
                    status: res.status,
                });
            }
        },
    },
    usage: {
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.RESULT,
            label: "agent steps",
            consumes: { credit: "default", amount: 0.016 },
        },
        estimate: ({ data }) => ({
            counts: {
                "RESULT": data.input.body.agent_config?.max_steps ?? 150,
            },
        }),
        evidence: ({ data, utils }) => ({
            counts: {
                "RESULT":
                    utils.json.optionalNum(data.output, "$.num_of_steps") ??
                        0,
            },
        }),
    },
});
