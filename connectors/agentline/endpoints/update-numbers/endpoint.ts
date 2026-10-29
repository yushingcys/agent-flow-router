import { z } from "zod";
import { defineEndpoint } from "@shared/core";
import { zNumberId, zPersonaFields } from "../../schema/common.ts";

/**
 * /update-numbers/{id} - edit an owned number's persona in place:
 * `PATCH /v1/agents/{agent}` through the stored agent pointer. Omitted
 * fields keep their values upstream.
 */
export default defineEndpoint({
    meta: {
        displayName: "Update Phone Number",
        summary:
            "Update the AI persona of a phone number you own (instructions, greeting, voice, voicemail).",
        description: "Change one of YOUR numbers' AI persona in place: " +
            "name, system_prompt (replaces the previous one), " +
            "initial_greeting, voice_id (/list-voices) or " +
            "voicemail_message. Omitted fields keep their values. Takes " +
            "effect on the next call; calls in progress are unaffected. " +
            "Returns the updated persona.",
        docsUrl: "https://docs.agentline.cloud/guides/agents",
        categories: ["agentic-phone"],
        notes: ["Send at least one field; an empty update answers 400."],
    },
    endpoint: "/update-numbers/{id}",
    /** The agent id is the stored pointer, never an input: the start
     *  below builds the real `/v1/agents/{agent}` path. */
    request: { method: "PATCH", path: "/v1/agents" },
    input: {
        schema: {
            pathParams: z.object({ id: zNumberId }).strict(),
            body: z.object({
                name: z.string().min(1).describe(
                    "Display name of the persona.",
                ).optional(),
                ...zPersonaFields,
            }).strict(),
        },
    },
    resources: {
        updates: [{ id: "agentline/phone-number", key: "$.pathParams.id" }],
    },
    lifecycle: {
        start: async ({ data, utils }) => {
            const $ = utils.json;
            const res = await utils.http({
                method: "PATCH",
                path: "/v1/agents/" +
                    encodeURIComponent(
                        $.str(data.resources!.id.data, "$.externalRefs.agent"),
                    ),
                body: data.input.body!,
            });
            if (res.status < 200 || res.status >= 300) {
                return {
                    kind: "COMPLETED",
                    httpStatus: res.status,
                    output: res.body,
                };
            }
            return {
                kind: "COMPLETED",
                httpStatus: res.status,
                output: $.pick(res.body, [
                    "$.name",
                    "$.system_prompt",
                    "$.initial_greeting",
                    "$.voice_id",
                    "$.voicemail_message",
                ]),
            };
        },
    },
});
