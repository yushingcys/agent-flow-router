import { defineEndpoint, UsageModelKind } from "@shared/core";
import { inboxItemPath } from "../../../schema/common.ts";

/**
 * `DELETE /v0/inboxes/{inbox_id}/messages/{id}` - permanently delete one
 * message from an inbox you own; this is not reversible.
 */
export default defineEndpoint({
    meta: {
        displayName: "Delete Email Message",
        summary:
            "Permanently delete one message from an inbox you own; this is not reversible.",
        description:
            "Permanently delete one message from an inbox you own. This " +
            "cannot be undone.",
        docsUrl:
            "https://docs.agentmail.to/api-reference/inboxes/messages/delete",
        categories: ["agentic-email"],
    },
    endpoint: "/delete-messages/{id}",
    request: { method: "DELETE", path: "/v0/inboxes/{inbox_id}/messages/{id}" },
    input: {
        schema: { pathParams: inboxItemPath("message") },
    },
    resources: {
        uses: [{ id: "agentmail/inbox", key: "$.pathParams.inbox_id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
