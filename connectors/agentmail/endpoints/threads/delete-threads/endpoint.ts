import { defineEndpoint, UsageModelKind } from "@shared/core";
import { inboxItemPath } from "../../../schema/common.ts";

/**
 * `DELETE /v0/inboxes/{inbox_id}/threads/{id}` - permanently delete one of
 * your email threads and all its messages.
 *
 * Inbox-scoped on purpose: the org-wide `/v0/threads` routes span every
 * tenant of the pooled organization, so `inbox_id` is required and gated.
 */
export default defineEndpoint({
    meta: {
        displayName: "Delete Email Thread",
        summary:
            "Permanently delete one of your email threads and all its messages.",
        description:
            "Permanently delete a conversation in one of your inboxes " +
            "together with all of its messages. This cannot be undone.",
        docsUrl:
            "https://docs.agentmail.to/api-reference/inboxes/threads/delete",
        categories: ["agentic-email"],
    },
    endpoint: "/delete-threads/{id}",
    request: { method: "DELETE", path: "/v0/inboxes/{inbox_id}/threads/{id}" },
    input: {
        schema: { pathParams: inboxItemPath("thread") },
    },
    resources: {
        uses: [{ id: "agentmail/inbox", key: "$.pathParams.inbox_id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
