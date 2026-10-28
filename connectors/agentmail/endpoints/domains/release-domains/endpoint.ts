import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zDomainId } from "../../../schema/common.ts";

/**
 * `DELETE /v0/domains/{id}` - delete a custom domain you own. Immediate and
 * permanent.
 */
export default defineEndpoint({
    meta: {
        displayName: "Release Email Domain",
        summary: "Delete a custom domain you own. Immediate and permanent.",
        description:
            "Release a custom domain you own: AgentMail deletes it at once " +
            "and the monthly charge stops. Inboxes on it can no longer send" +
            " or receive.",
        docsUrl: "https://docs.agentmail.to/api-reference/domains/delete",
        categories: ["agentic-email"],
        notes: [
            "Irreversible: the domain is deleted immediately. No refund for the current month.",
        ],
    },
    endpoint: "/release-domains/{id}",
    request: { method: "DELETE", path: "/v0/domains/{id}" },
    input: {
        schema: { pathParams: z.object({ id: zDomainId }).strict() },
    },
    resources: {
        releases: [{ id: "agentmail/domain", key: "$.pathParams.id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
