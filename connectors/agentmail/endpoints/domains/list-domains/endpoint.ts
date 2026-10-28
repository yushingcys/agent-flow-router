import { defineEndpoint, UsageModelKind } from "@shared/core";

/**
 * List YOUR custom domains, served entirely from the ownership window -
 * never AgentMail's pooled `GET /v0/domains`.
 */
export default defineEndpoint({
    meta: {
        displayName: "List Your Email Domains",
        summary:
            "List the custom sending domains you own (name, state, renewal).",
        description: "List the custom domains this workspace owns: each " +
            "one's `domain_id`, name and last known verification status. " +
            "Use /domains/{id} for the live DNS state.",
        docsUrl: "https://docs.agentmail.to/managing-domains",
        categories: ["agentic-email"],
    },
    endpoint: "/list-domains",
    request: { method: "GET", path: "/v0/domains" },
    resources: { reads: [{ id: "agentmail/domain" }] },
    usage: { model: { kind: UsageModelKind.FREE } },
    lifecycle: {
        start: async ({ utils }) => {
            const $ = utils.json;
            const rows = await utils.resources.owned({
                resource: "agentmail/domain",
            });
            const domains = rows.map((row) => ({
                domain_id: row.externalId,
                domain: $.optionalStr(row.data, "$.domain") ?? row.externalId,
                ...($.optionalStr(row.data, "$.status") !== undefined
                    ? { status: $.get(row.data, "$.status") }
                    : {}),
                ...(row.syncedAt !== undefined
                    ? { synced_at: row.syncedAt }
                    : {}),
            }));
            return {
                kind: "COMPLETED",
                httpStatus: 200,
                output: { count: domains.length, domains },
            };
        },
    },
});
