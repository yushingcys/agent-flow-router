import { defineProvider, presets } from "@shared/core";

/**
 * AgentMail (agentmail.to) - email inboxes built for AI agents: create
 * inboxes, send, reply and forward, read threads, review drafts before they
 * send, and register custom sending domains. Bearer-key REST against
 * `https://api.agentmail.to/v0` (OpenAPI read 2026-10-27).
 *
 * POOLED TENANCY: Agent Flow holds ONE AgentMail organization for every
 * workspace, so the org-wide routes (`GET /v0/inboxes`, `/v0/threads`,
 * `/v0/drafts`, `/v0/lists`) would leak other tenants' mail. They are never
 * relayed. Inboxes and domains are OWNED RESOURCES; every mail route goes
 * through the inbox-scoped path (`/v0/inboxes/{inbox_id}/...`), whose
 * `inbox_id` the binding pre-gates, so upstream itself confines the read or
 * write to that inbox.
 *
 * RATE CARD (Monid, monid.ai/tools/agentmail, read 2026-10-27): an inbox
 * and a custom domain are $1/month each, a send / reply / forward / draft
 * send is $0.001, everything else is free. The pool is US dollars.
 */
export default defineProvider({
    name: "agentmail",
    meta: {
        displayName: "AgentMail",
        summary:
            "Email inboxes for AI agents - send, receive, reply, threads, drafts.",
        description: "AgentMail gives an agent a real email inbox of its " +
            "own: create an address, send and reply to mail, read " +
            "conversations as threads, keep a human in the loop with " +
            "drafts that are reviewed before they send, label messages to " +
            "track state, control who can reach the inbox with allow and " +
            "block lists, and send from your own domain. Inboxes and " +
            "domains are workspace-OWNED resources at $1/month each.",
        homepageUrl: "https://agentmail.to",
        docsUrl: "https://docs.agentmail.to",
        categories: ["agentic-email"],
        notes: [
            "Inboxes and custom domains are OWNED RESOURCES: inbox- and " +
            "domain-scoped endpoints only operate on ones this workspace " +
            "created - a foreign or unknown id is a uniform 404.",
            "AgentMail does not support cold outreach; recipients that " +
            "bounce or complain hurt the inbox's sending reputation.",
        ],
    },
    auth: { inject: presets.auth.bearer() },
    request: { baseUrl: "https://api.agentmail.to" },
    usage: { credits: { default: { label: "US dollars" } } },
    output: {
        /** The pooled organization's ids are plumbing, never user data. */
        fromResponse: ({ data, utils }) =>
            utils.json.omit(data.output, ["pod_id", "organization_id"]),
        /** AgentMail's error envelope is `{name, message, code?, fix?}`. */
        fromError: ({ data, utils }) => {
            const message = utils.json.optionalStr(data.output, "$.message");
            return {
                message: message !== undefined && message !== ""
                    ? message
                    : "AgentMail API error",
                raw: utils.json.omit(data.output, [
                    "pod_id",
                    "organization_id",
                ]),
            };
        },
    },
});
