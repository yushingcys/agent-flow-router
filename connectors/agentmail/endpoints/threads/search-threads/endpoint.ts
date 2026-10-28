import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zInboxPath, zPaging, zWindow } from "../../../schema/common.ts";

/**
 * `GET /v0/inboxes/{inbox_id}/threads/search` - full-text search over the
 * threads in one of your inboxes (senders, subjects, bodies).
 *
 * Inbox-scoped on purpose: the org-wide `/v0/threads` routes span every
 * tenant of the pooled organization, so `inbox_id` is required and gated.
 */
export default defineEndpoint({
    meta: {
        displayName: "Search Email Threads",
        summary:
            "Full-text search over the threads in one of your inboxes (senders, subjects, bodies).",
        description:
            "Full-text search over the conversations in one of your inboxes" +
            " - senders, subjects and bodies - best match first, with " +
            "highlighted snippets.",
        docsUrl:
            "https://docs.agentmail.to/api-reference/inboxes/threads/search",
        categories: ["agentic-email"],
    },
    endpoint: "/search-threads",
    request: { method: "GET", path: "/v0/inboxes/{inbox_id}/threads/search" },
    input: {
        schema: {
            pathParams: zInboxPath,
            queryParams: z.object({
                q: z.string().min(1).describe("The full-text query."),
                ...zPaging,
                ...zWindow,
            }).strict(),
        },
    },
    resources: {
        reads: [{ id: "agentmail/inbox", key: "$.pathParams.inbox_id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
