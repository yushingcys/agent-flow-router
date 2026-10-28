import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import { inboxItemPath, zLabels } from "../../../schema/common.ts";

/**
 * `PATCH /v0/inboxes/{inbox_id}/threads/{id}` - add or remove labels on one
 * of your email threads (the only mutable field).
 *
 * Inbox-scoped on purpose: the org-wide `/v0/threads` routes span every
 * tenant of the pooled organization, so `inbox_id` is required and gated.
 */
export default defineEndpoint({
    meta: {
        displayName: "Update Email Thread",
        summary:
            "Add or remove labels on one of your email threads (the only mutable field).",
        description:
            "Add or remove labels on a conversation in one of your inboxes." +
            " System labels cannot be changed; a label in both lists is " +
            "removed.",
        docsUrl:
            "https://docs.agentmail.to/api-reference/inboxes/threads/update",
        categories: ["agentic-email"],
    },
    endpoint: "/update-threads/{id}",
    request: { method: "PATCH", path: "/v0/inboxes/{inbox_id}/threads/{id}" },
    input: {
        schema: {
            pathParams: inboxItemPath("thread"),
            body: z.object({
                add_labels: zLabels.optional(),
                remove_labels: zLabels.optional(),
            }).strict(),
        },
    },
    resources: {
        uses: [{ id: "agentmail/inbox", key: "$.pathParams.inbox_id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
