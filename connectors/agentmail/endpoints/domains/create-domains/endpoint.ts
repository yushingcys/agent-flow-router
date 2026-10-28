import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";

/**
 * `POST /v0/domains` - register a custom sending domain, the
 * agentmail/domain CREATES anchor. A declarative relay: the body carries
 * no org-wide idempotency key, and a domain name can only be registered
 * once upstream.
 */
export const zCreateDomainBody = z.object({
    domain: z.string().min(1).describe("The domain, e.g. example.com."),
    allow_conflicting_provider: z.boolean().optional().describe(
        "Register even when the domain has Google Workspace MX records.",
    ),
    feedback_enabled: z.boolean().optional().describe(
        "Send bounce and complaint notifications to your inboxes.",
    ),
    inbound_enabled: z.boolean().optional().describe(
        "Receive email on this domain (default true); false = send-only.",
    ),
    subdomains_enabled: z.boolean().optional().describe(
        "Allow inboxes on any subdomain (adds a wildcard MX record).",
    ),
    tracking_enabled: z.boolean().optional().describe(
        "Serve open-tracking pixels (adds a link.<domain> CNAME).",
    ),
}).strict();

export default defineEndpoint({
    meta: {
        displayName: "Create Custom Email Domain",
        summary:
            "Register a custom sending domain ($1/month); returns the DNS records to create at your registrar.",
        description: "Register a domain you control so your inboxes can " +
            "send and receive as name@your-domain. Returns the domain's " +
            "`domain_id` and the DNS records (MX, SPF, DKIM, DMARC) to " +
            "create at your registrar; then call /verify-domains/{id}. " +
            "The domain renews at $1/month until you release it.",
        docsUrl: "https://docs.agentmail.to/api-reference/domains/create",
        categories: ["agentic-email"],
        notes: [
            "Running this SPENDS MONEY: $1 for the first month, then " +
            "$1/month until released.",
        ],
    },
    endpoint: "/create-domains",
    request: { method: "POST", path: "/v0/domains" },
    input: { schema: { body: zCreateDomainBody } },
    resources: {
        provisions: [{
            id: "agentmail/domain",
            seed: ({ data, utils }) => {
                const $ = utils.json;
                const id = $.optionalStr(data.output, "$.domain_id");
                if (id === undefined) {
                    throw new Error(
                        "agentmail returned success but no domain_id",
                    );
                }
                const domain = $.optionalStr(data.output, "$.domain") ??
                    $.str(data.input.body ?? {}, "$.domain");
                const status = $.optionalStr(data.output, "$.status");
                return {
                    resource: "agentmail/domain",
                    externalId: id,
                    identifier: domain,
                    data: {
                        domain,
                        ...(status !== undefined ? { status } : {}),
                    },
                };
            },
        }],
    },
    usage: {
        model: {
            kind: UsageModelKind.PER_CALL,
            label: "domain + first month",
            consumes: { credit: "default", amount: 1 },
        },
    },
});
