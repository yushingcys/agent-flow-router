import { z } from "zod";
import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zE164, zNumberId, zPersonaFields } from "../../schema/common.ts";

/**
 * /place-calls - THE metered async endpoint: the RUN is the call. Start
 * dials (`POST /v1/calls`, as the owned number's persona), poll reads
 * `GET /v1/calls/{id}` until a terminal status, and STOPPING the run is
 * the hangup (`POST /v1/calls/{id}/hangup`), which settles the call. The
 * hold grows with the call: the estimate re-runs every 30 s.
 *
 * BILLING: $0.12 per minute, a 0-second call free, a connected call a
 * one-minute minimum and then its actual duration - so the evidence is
 * max(60, duration) seconds at $0.002 each, or 0 when nothing connected.
 * ponytail: AgentLine rounds the total UP to the cent; the fold does not,
 * so a call can read up to $0.01 under the vendor's charge.
 */
export const zPlaceCallBody = z.object({
    from_number_id: zNumberId.describe(
        "The id of a phone number YOU OWN to call from.",
    ),
    to_number: zE164.describe(
        'The number to call, E.164, e.g. "+12125557890".',
    ),
    system_prompt: zPersonaFields.system_prompt.unwrap().describe(
        "Instructions for THIS call only, replacing the persona's.",
    ).optional(),
    initial_greeting: zPersonaFields.initial_greeting.unwrap().describe(
        "Opening line for THIS call only.",
    ).optional(),
    voice_id: zPersonaFields.voice_id.unwrap().describe(
        "Voice for THIS call only (a preset or voice_id from /list-voices).",
    ).optional(),
}).strict();

export default defineEndpoint({
    meta: {
        displayName: "Place Outbound Call",
        summary:
            "Place an outbound AI phone call from your number. Stop the run to hang up.",
        description: "Place an outbound call from a number you own; the " +
            "number's AI persona holds the conversation, navigates phone " +
            "menus and leaves the persona's voicemail_message on a " +
            "mailbox. Optional system_prompt, initial_greeting and " +
            "voice_id override the persona for this call. The RUN is the " +
            "call: it stays RUNNING while the call is live and completes " +
            "with the call record (status, duration_seconds, transcript); " +
            "stop the run to hang up.",
        docsUrl: "https://docs.agentline.cloud/guides/calls",
        categories: ["agentic-phone"],
        notes: [
            "Running this SPENDS MONEY: $0.12 per minute, one-minute " +
            "minimum once connected; an unanswered call is free.",
            "The call reaches a real third party and every run dials " +
            "again - confirm with the user first.",
        ],
    },
    endpoint: "/place-calls",
    request: { method: "POST", path: "/v1/calls" },
    input: { schema: { body: zPlaceCallBody } },
    timeouts: {
        requestMs: 30_000,
        pollMs: 5_000,
        // safety net - a call should never legitimately run this long
        runMs: 4 * 60 * 60 * 1000,
    },
    resources: {
        uses: [{
            id: "agentline/phone-number",
            key: "$.body.from_number_id",
        }],
    },
    usage: {
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.SECOND,
            label: "call time",
            consumes: { credit: "default", amount: 0.002 },
        },
        /** At admission the one-minute minimum; on the 30 s re-runs the
         *  elapsed seconds - the hold grows with the live call. */
        estimate: ({ data }) => ({
            counts: {
                SECOND: Math.max(Math.ceil((data.elapsedMs ?? 0) / 1000), 60),
            },
        }),
        updateEstimateEveryMs: 30_000,
        evidence: ({ data, utils }) => {
            const seconds = utils.json.optionalNum(
                data.output,
                "$.duration_seconds",
            ) ?? 0;
            return {
                counts: {
                    SECOND: seconds > 0 ? Math.max(60, Math.ceil(seconds)) : 0,
                },
            };
        },
    },
    lifecycle: {
        start: async ({ data, utils }) => {
            const $ = utils.json;
            const body = data.input.body!;
            const res = await utils.http({
                method: "POST",
                path: "/v1/calls",
                body: {
                    ...body,
                    agent_id: $.str(
                        data.resources!.from_number_id.data,
                        "$.externalRefs.agent",
                    ),
                },
            });
            if (res.status < 200 || res.status >= 300) {
                return {
                    kind: "COMPLETED",
                    httpStatus: res.status,
                    output: res.body,
                };
            }
            const callId = $.optionalStr(res.body, "$.id") ??
                $.optionalStr(res.body, "$.call_id");
            if (callId === undefined) {
                return {
                    kind: "COMPLETED",
                    httpStatus: 502,
                    providerHttpStatus: res.status,
                    output: {
                        detail: "AgentLine dialed but returned no call id",
                    },
                };
            }
            return { kind: "RUNNING", state: { externalRunId: callId } };
        },
        poll: async ({ data, utils }) => {
            const callId = data.lifecycle.state.externalRunId;
            if (callId === undefined) {
                throw Object.assign(
                    new Error("agentline poll without a call id in state"),
                    { retriable: false },
                );
            }
            const res = await utils.http({
                method: "GET",
                path: "/v1/calls/" + encodeURIComponent(callId),
            });
            if (res.status === 429 || res.status >= 500) {
                // retriable read - never conclude from a flaky poll
                throw new Error(
                    "agentline call poll failed with HTTP " + res.status,
                );
            }
            if (res.status < 200 || res.status >= 300) {
                return {
                    kind: "COMPLETED",
                    httpStatus: res.status,
                    output: res.body,
                };
            }
            const status = utils.json.optionalStr(res.body, "$.status") ?? "";
            const terminal = [
                "completed",
                "failed",
                "busy",
                "no-answer",
                "canceled",
            ].includes(status);
            return terminal
                ? { kind: "COMPLETED", httpStatus: 200, output: res.body }
                : { kind: "RUNNING" };
        },
        /** The hangup; then a bounded wait for the final record, which
         *  carries the billable duration. */
        stop: async ({ data, utils }) => {
            const callId = data.lifecycle.state.externalRunId;
            if (callId === undefined) {
                return {
                    kind: "UNRESOLVED",
                    reason: "no call id in state - nothing to hang up",
                };
            }
            const path = "/v1/calls/" + encodeURIComponent(callId);
            const end = await utils.http({
                method: "POST",
                path: path + "/hangup",
            });
            if (
                !(end.status >= 200 && end.status < 300) &&
                end.status !== 404 && end.status !== 409
            ) {
                return {
                    kind: "UNRESOLVED",
                    reason: "hangup failed with HTTP " + end.status,
                };
            }
            for (let attempt = 0; attempt < 10; attempt++) {
                if (attempt > 0) await utils.sleep(3_000);
                const res = await utils.http({ method: "GET", path });
                if (res.status < 200 || res.status >= 300) continue;
                const status = utils.json.optionalStr(res.body, "$.status") ??
                    "";
                if (
                    [
                        "completed",
                        "failed",
                        "busy",
                        "no-answer",
                        "canceled",
                    ].includes(status)
                ) {
                    return {
                        kind: "COMPLETED",
                        httpStatus: 200,
                        output: res.body,
                    };
                }
            }
            return {
                kind: "UNRESOLVED",
                reason: "call hung up but its final record never arrived",
            };
        },
    },
});
