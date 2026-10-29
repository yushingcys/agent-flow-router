import { defineEndpoint } from "@shared/core";

/**
 * /list-numbers - YOUR numbers, served entirely from the ownership window,
 * never AgentLine's account-wide `GET /v1/numbers`.
 */
export default defineEndpoint({
    meta: {
        displayName: "List Your Phone Numbers",
        summary: "List the phone numbers you own (id, E.164, country).",
        description: "List the phone numbers this workspace owns: each " +
            "one's `id` (the number id every other AgentLine endpoint " +
            "takes), E.164 `phone_number` and country. Use " +
            "/get-numbers/{id} for the live record with its persona.",
        docsUrl: "https://docs.agentline.cloud/guides/numbers",
        categories: ["agentic-phone"],
    },
    endpoint: "/list-numbers",
    request: { method: "GET", path: "/v1/numbers" },
    resources: { reads: [{ id: "agentline/phone-number" }] },
    lifecycle: {
        start: async ({ utils }) => {
            const $ = utils.json;
            const rows = await utils.resources.owned({
                resource: "agentline/phone-number",
            });
            const numbers = rows.map((row) => ({
                id: row.externalId,
                ...($.optionalStr(row.data, "$.phoneNumber") !== undefined
                    ? { phone_number: $.get(row.data, "$.phoneNumber") }
                    : {}),
                country: $.optionalStr(row.data, "$.country") ?? "US",
                ...(row.syncedAt !== undefined
                    ? { synced_at: row.syncedAt }
                    : {}),
            }));
            return {
                kind: "COMPLETED",
                httpStatus: 200,
                output: { count: numbers.length, numbers },
            };
        },
    },
});
