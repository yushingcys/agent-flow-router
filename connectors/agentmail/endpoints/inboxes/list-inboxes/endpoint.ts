import { defineEndpoint, UsageModelKind } from "@shared/core";

/**
 * List YOUR inboxes, served entirely from the ownership window - never
 * AgentMail's `GET /v0/inboxes`, which lists every tenant of the pooled
 * organization.
 */
export default defineEndpoint({
    meta: {
        displayName: "List Your Email Inboxes",
        summary: "List the email inboxes you own (address, state).",
        description: "List the email inboxes this workspace owns: each " +
            "one's `inbox_id` (its address, which every other AgentMail " +
            "endpoint takes) and display name. Use /inboxes/{id} for the " +
            "live record.",
        docsUrl: "https://docs.agentmail.to/inboxes",
        categories: ["agentic-email"],
    },
    endpoint: "/list-inboxes",
    request: { method: "GET", path: "/v0/inboxes" },
    resources: { reads: [{ id: "agentmail/inbox" }] },
    usage: { model: { kind: UsageModelKind.FREE } },
    lifecycle: {
        start: async ({ utils }) => {
            const $ = utils.json;
            const rows = await utils.resources.owned({
                resource: "agentmail/inbox",
            });
            const inboxes = rows.map((row) => ({
                inbox_id: row.externalId,
                email: $.optionalStr(row.data, "$.email") ?? row.externalId,
                ...($.optionalStr(row.data, "$.display_name") !== undefined
                    ? { display_name: $.get(row.data, "$.display_name") }
                    : {}),
                ...(row.syncedAt !== undefined
                    ? { synced_at: row.syncedAt }
                    : {}),
            }));
            return {
                kind: "COMPLETED",
                httpStatus: 200,
                output: { count: inboxes.length, inboxes },
            };
        },
    },
});
