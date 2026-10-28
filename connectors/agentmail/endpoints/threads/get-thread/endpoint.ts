import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import { inboxItemPath } from "../../../schema/common.ts";

/**
 * `GET /v0/inboxes/{inbox_id}/threads/{id}` - get one thread from your
 * inboxes, including its full message list.
 *
 * Inbox-scoped on purpose: the org-wide `/v0/threads` routes span every
 * tenant of the pooled organization, so `inbox_id` is required and gated.
 */
export default defineEndpoint({
    meta: {
        displayName: "Get Email Thread",
        summary:
            "Get one thread from your inboxes, including its full message list.",
        description:
            "Read one conversation with its messages (newest page first, up" +
            " to 100 per page): every message's sender, recipients, bodies " +
            "and attachments, plus the thread's labels and counts.",
        docsUrl: "https://docs.agentmail.to/api-reference/inboxes/threads/get",
        categories: ["agentic-email"],
    },
    endpoint: "/threads/{id}",
    request: { method: "GET", path: "/v0/inboxes/{inbox_id}/threads/{id}" },
    input: {
        schema: {
            pathParams: inboxItemPath("thread"),
            queryParams: z.object({
                limit: z.number().int().min(1).max(100).optional().describe(
                    "Messages per page (at most 100).",
                ),
                page_token: z.string().optional(),
            }).strict(),
        },
    },
    resources: {
        reads: [{ id: "agentmail/inbox", key: "$.pathParams.inbox_id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
