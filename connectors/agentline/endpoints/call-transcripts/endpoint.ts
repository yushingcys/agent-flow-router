import { z } from "zod";
import { defineEndpoint, type Json } from "@shared/core";
import { zCallId, zNumberQuery } from "../../schema/common.ts";

/**
 * /calls/{id}/transcript - the transcript of a call on an owned number.
 * The transcript carries no agent, so the call record is the ANCHOR: it
 * is read first and pair-verified against the gated number's persona,
 * then the transcript is fetched.
 */
export default defineEndpoint({
    meta: {
        displayName: "Get Call Transcript",
        summary: "Get the transcript of a call on a number you own.",
        description: "Read a call's transcript as turns of {role, text, " +
            "timestamp} - role `agent` is your number's AI persona, " +
            "`human` the other party - plus the call status. Poll it during " +
            "a live call to follow the conversation. Pass the call id as " +
            "`id` and the number id as `number_id`.",
        docsUrl: "https://docs.agentline.cloud/guides/calls",
        categories: ["agentic-phone"],
    },
    endpoint: "/calls/{id}/transcript",
    request: { method: "GET", path: "/v1/calls/{id}/transcript" },
    input: {
        schema: {
            pathParams: z.object({ id: zCallId }).strict(),
            queryParams: z.object(zNumberQuery).strict(),
        },
    },
    resources: {
        uses: [{
            id: "agentline/phone-number",
            key: "$.queryParams.number_id",
        }],
    },
    lifecycle: {
        start: async ({ data, utils }) => {
            const $ = utils.json;
            const anchor = await utils.http({
                method: "GET",
                path: "/v1/calls/" +
                    encodeURIComponent(
                        String(
                            (data.input.pathParams as Record<string, unknown>)
                                .id,
                        ),
                    ),
            });
            if (anchor.status >= 500) {
                throw new Error(
                    "agentline call lookup failed with HTTP " + anchor.status,
                );
            }
            if (
                anchor.status < 200 || anchor.status >= 300 ||
                $.optionalStr(anchor.body, "$.agent_id") !==
                    $.str(
                        data.resources!.number_id.data,
                        "$.externalRefs.agent",
                    )
            ) {
                return {
                    kind: "COMPLETED",
                    httpStatus: 404,
                    providerHttpStatus: anchor.status,
                    output: { detail: "Call not found" } as Json,
                };
            }
            const res = await utils.http({
                method: "GET",
                url: data.request.url,
            });
            return {
                kind: "COMPLETED",
                httpStatus: res.status,
                output: res.body,
            };
        },
    },
});
