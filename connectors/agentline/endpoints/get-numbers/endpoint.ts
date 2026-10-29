import { z } from "zod";
import { defineEndpoint, type Json } from "@shared/core";
import { zNumberId } from "../../schema/common.ts";

/**
 * /get-numbers/{id} - one owned number fresh from AgentLine
 * (`GET /v1/numbers/{id}`) plus its LIVE persona read through the stored
 * agent pointer (`GET /v1/agents/{agent}`).
 */
export default defineEndpoint({
    meta: {
        displayName: "Get Phone Number",
        summary:
            "Get a phone number you own together with its current AI persona.",
        description: "Read one of YOUR numbers live: its E.164 " +
            "`phone_number`, country and status, plus its AI persona under " +
            "`agent` - name, system_prompt, initial_greeting, voice_id and " +
            "voicemail_message, read fresh on every call.",
        docsUrl: "https://docs.agentline.cloud/guides/agents",
        categories: ["agentic-phone"],
    },
    endpoint: "/get-numbers/{id}",
    request: { method: "GET", path: "/v1/numbers/{id}" },
    input: {
        schema: { pathParams: z.object({ id: zNumberId }).strict() },
    },
    resources: {
        reads: [{ id: "agentline/phone-number", key: "$.pathParams.id" }],
    },
    lifecycle: {
        start: async ({ data, utils }) => {
            const $ = utils.json;
            const res = await utils.request();
            if (res.status < 200 || res.status >= 300) {
                return {
                    kind: "COMPLETED",
                    httpStatus: res.status,
                    output: res.body,
                };
            }
            const agent = await utils.http({
                method: "GET",
                path: "/v1/agents/" +
                    encodeURIComponent(
                        $.str(data.resources!.id.data, "$.externalRefs.agent"),
                    ),
            });
            if (agent.status < 200 || agent.status >= 300) {
                return {
                    kind: "COMPLETED",
                    httpStatus: 502,
                    providerHttpStatus: agent.status,
                    output: {
                        detail: "The number's persona could not be read " +
                            "right now - try again",
                    } as Json,
                };
            }
            return {
                kind: "COMPLETED",
                httpStatus: 200,
                output: $.merge(res.body, {
                    agent: $.pick(agent.body, [
                        "$.name",
                        "$.system_prompt",
                        "$.initial_greeting",
                        "$.voice_id",
                        "$.voicemail_message",
                    ]),
                }),
            };
        },
    },
});
