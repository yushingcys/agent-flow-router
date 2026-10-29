import { z } from "zod";
import { defineEndpoint, type Json, UsageModelKind } from "@shared/core";
import { zPersonaFields } from "../../schema/common.ts";

/**
 * /provision-numbers - buy a number WITH its persona, the
 * agentline/phone-number CREATES anchor. Two upstream steps: create the
 * persona (`POST /v1/agents`), then buy a number assigned to it
 * (`POST /v1/numbers`). A failed buy deletes the just-created persona so
 * nothing is orphaned. The persona's id rides in the output for the seed,
 * but no endpoint takes it as input - the number id is the only handle.
 *
 * ponytail: AgentLine takes no idempotency key, so a host retry of a
 * crashed start can buy a second number; key the agent name on the run
 * id if retries ever show up in practice.
 */
export const zProvisionBody = z.object({
    country: z.enum(["US", "CA"]).describe(
        "Country of the number: US or CA.",
    ).optional(),
    area_code: z.string().regex(/^\d{3}$/).describe(
        "Preferred 3-digit area code (e.g. 212, 415, 416). Omit to take " +
            "any available number.",
    ).optional(),
    agent: z.object({
        name: z.string().min(1).describe("Display name of the persona."),
        ...zPersonaFields,
    }).strict().describe(
        "The AI voice persona behind the number.",
    ),
}).strict();

export default defineEndpoint({
    meta: {
        displayName: "Provision Phone Number",
        summary:
            "Buy a real phone number with the AI voice persona that answers and places its calls.",
        description: "Buy a real US or Canadian local phone number and " +
            "define the AI persona behind it: name, system_prompt " +
            "(instructions), initial_greeting, voice_id (/list-voices) " +
            "and voicemail_message. The persona answers inbound calls and " +
            "speaks on calls placed with /place-calls. Returns the " +
            "number's `id` (every other endpoint's number id), its E.164 " +
            "`phone_number` and the persona. The number renews at " +
            "$3/month until released.",
        docsUrl: "https://docs.agentline.cloud/guides/numbers",
        categories: ["agentic-phone"],
        notes: [
            "Running this SPENDS MONEY: $3 for the first month, then " +
            "$3/month until released.",
            "Not a list - to see the numbers you already own use " +
            "/list-numbers (free).",
        ],
    },
    endpoint: "/provision-numbers",
    request: { method: "POST", path: "/v1/numbers" },
    input: {
        schema: {
            body: zProvisionBody.extend({
                country: zProvisionBody.shape.country.unwrap().default("US"),
            }),
        },
    },
    resources: {
        provisions: [{
            id: "agentline/phone-number",
            /** A 2xx with no readable number or persona id is never
             *  "nothing provisioned" for a paid buy - the throw is the
             *  host's alarm. */
            seed: ({ data, utils }) => {
                const $ = utils.json;
                const id = $.optionalStr(data.output, "$.id");
                const agent = $.optionalStr(data.output, "$.agent.id") ??
                    $.optionalStr(data.output, "$.agent_id");
                if (id === undefined || agent === undefined) {
                    throw new Error(
                        "agentline returned success but no number or agent id",
                    );
                }
                const phoneNumber = $.optionalStr(
                    data.output,
                    "$.phone_number",
                );
                return {
                    resource: "agentline/phone-number",
                    externalId: id,
                    identifier: phoneNumber ?? id,
                    data: {
                        country: $.optionalStr(data.output, "$.country") ??
                            $.str(data.input.body ?? {}, "$.country"),
                        externalRefs: { agent },
                        ...(phoneNumber !== undefined ? { phoneNumber } : {}),
                    },
                };
            },
        }],
    },
    usage: {
        model: {
            kind: UsageModelKind.PER_CALL,
            label: "number + first month",
            consumes: { credit: "default", amount: 3 },
        },
    },
    lifecycle: {
        start: async ({ data, utils, logger }) => {
            const $ = utils.json;
            const body = data.input.body!;
            const created = await utils.http({
                method: "POST",
                path: "/v1/agents",
                body: body.agent,
            });
            if (created.status < 200 || created.status >= 300) {
                return {
                    kind: "COMPLETED",
                    httpStatus: created.status,
                    output: created.body,
                };
            }
            const agentId = $.optionalStr(created.body, "$.id");
            if (agentId === undefined) {
                throw new Error("agentline created a persona with no id");
            }
            const bought = await utils.http({
                method: "POST",
                path: "/v1/numbers",
                body: {
                    agent_id: agentId,
                    country: body.country,
                    number_type: "local",
                    ...(body.area_code !== undefined
                        ? { area_code: body.area_code }
                        : {}),
                },
            });
            if (bought.status < 200 || bought.status >= 300) {
                const cleanup = await utils.http({
                    method: "DELETE",
                    path: "/v1/agents/" + encodeURIComponent(agentId),
                });
                if (cleanup.status < 200 || cleanup.status >= 300) {
                    logger.warn("agentline orphan persona delete failed", {
                        agentId,
                        status: cleanup.status,
                    });
                }
                return {
                    kind: "COMPLETED",
                    httpStatus: bought.status,
                    output: bought.body,
                };
            }
            return {
                kind: "COMPLETED",
                httpStatus: bought.status,
                output: $.merge(bought.body, {
                    agent: $.pick(created.body, [
                        "$.id",
                        "$.name",
                        "$.system_prompt",
                        "$.initial_greeting",
                        "$.voice_id",
                        "$.voicemail_message",
                    ]),
                }) as Json,
            };
        },
    },
});
