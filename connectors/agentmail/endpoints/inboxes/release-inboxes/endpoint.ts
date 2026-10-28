import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zInboxId } from "../../../schema/common.ts";

/**
 * `DELETE /v0/inboxes/{id}` - release an inbox - it is deleted IMMEDIATELY
 * and all its mail is lost.
 */
export default defineEndpoint({
    meta: {
        displayName: "Release Email Inbox",
        summary:
            "Release an inbox - it is deleted IMMEDIATELY and all its mail is lost.",
        description: "Release an inbox you own. AgentMail deletes it at once " +
            "together with every message, thread and draft in it, and the " +
            "monthly charge stops. This cannot be undone.",
        docsUrl: "https://docs.agentmail.to/api-reference/inboxes/delete",
        categories: ["agentic-email"],
        notes: [
            "Irreversible: the inbox and all its mail are deleted immediately. No refund for the current month.",
        ],
    },
    endpoint: "/release-inboxes/{id}",
    request: { method: "DELETE", path: "/v0/inboxes/{id}" },
    input: {
        schema: { pathParams: z.object({ id: zInboxId }).strict() },
    },
    resources: {
        releases: [{ id: "agentmail/inbox", key: "$.pathParams.id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
