import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zDomainId } from "../../../schema/common.ts";

/**
 * `GET /v0/domains/{id}` - get one of your domains fresh from the provider
 * - verification status and per-record DNS state.
 */
export default defineEndpoint({
    meta: {
        displayName: "Get Email Domain",
        summary:
            "Get one of your domains fresh from the provider - verification status and per-record DNS state.",
        description:
            "Read one custom domain you own straight from AgentMail: its " +
            "verification status (and why it is not verified yet), and " +
            "every DNS record it needs with that record's own status.",
        docsUrl: "https://docs.agentmail.to/api-reference/domains/get",
        categories: ["agentic-email"],
    },
    endpoint: "/domains/{id}",
    request: { method: "GET", path: "/v0/domains/{id}" },
    input: {
        schema: { pathParams: z.object({ id: zDomainId }).strict() },
    },
    resources: { reads: [{ id: "agentmail/domain", key: "$.pathParams.id" }] },
    usage: { model: { kind: UsageModelKind.FREE } },
});
