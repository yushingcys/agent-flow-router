import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zDomainId } from "../../../schema/common.ts";

/**
 * `POST /v0/domains/{id}/verify` - trigger the provider's DNS verification
 * check on one of your domains.
 */
export default defineEndpoint({
    meta: {
        displayName: "Verify Email Domain",
        summary:
            "Trigger the provider's DNS verification check on one of your domains.",
        description:
            "Ask AgentMail to re-check the DNS records of a custom domain " +
            "you own, after adding them at your registrar. Read the outcome" +
            " with /domains/{id}.",
        docsUrl: "https://docs.agentmail.to/api-reference/domains/verify",
        categories: ["agentic-email"],
    },
    endpoint: "/verify-domains/{id}",
    request: { method: "POST", path: "/v0/domains/{id}/verify" },
    input: {
        schema: { pathParams: z.object({ id: zDomainId }).strict() },
    },
    resources: {
        updates: [{ id: "agentmail/domain", key: "$.pathParams.id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
