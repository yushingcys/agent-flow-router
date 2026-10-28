import { defineEndpoint, UsageModelKind } from "@shared/core";
import { inboxItemPath } from "../../../schema/common.ts";

/**
 * `DELETE /v0/inboxes/{inbox_id}/drafts/{id}` - permanently delete a draft
 * from one of your inboxes.
 */
export default defineEndpoint({
    meta: {
        displayName: "Delete Email Draft",
        summary: "Permanently delete a draft from one of your inboxes.",
        description: "Permanently delete a draft from one of your inboxes; a " +
            "scheduled draft is cancelled.",
        docsUrl:
            "https://docs.agentmail.to/api-reference/inboxes/drafts/delete",
        categories: ["agentic-email"],
    },
    endpoint: "/delete-drafts/{id}",
    request: { method: "DELETE", path: "/v0/inboxes/{inbox_id}/drafts/{id}" },
    input: {
        schema: { pathParams: inboxItemPath("draft") },
    },
    resources: {
        uses: [{ id: "agentmail/inbox", key: "$.pathParams.inbox_id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
