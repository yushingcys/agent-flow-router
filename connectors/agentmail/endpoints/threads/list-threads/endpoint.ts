import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import {
    zInboxPath,
    zLabels,
    zPaging,
    zWindow,
} from "../../../schema/common.ts";

/**
 * `GET /v0/inboxes/{inbox_id}/threads` - list conversation threads in one
 * of your inboxes, with filters and pagination.
 *
 * Inbox-scoped on purpose: the org-wide `/v0/threads` routes span every
 * tenant of the pooled organization, so `inbox_id` is required and gated.
 */
export default defineEndpoint({
    meta: {
        displayName: "List Email Threads",
        summary:
            "List conversation threads in one of your inboxes, with filters and pagination.",
        description:
            "List the conversations in one of your inboxes, most recent " +
            "first: subject, senders, recipients, preview, labels, message " +
            "count and timestamps. Filter by label, time window, sender, " +
            "recipient or subject; page with `page_token`.",
        docsUrl: "https://docs.agentmail.to/api-reference/inboxes/threads/list",
        categories: ["agentic-email"],
    },
    endpoint: "/list-threads",
    request: { method: "GET", path: "/v0/inboxes/{inbox_id}/threads" },
    input: {
        schema: {
            pathParams: zInboxPath,
            queryParams: z.object({
                ...zPaging,
                ...zWindow,
                labels: zLabels.optional(),
                ascending: z.boolean().optional(),
                include_spam: z.boolean().optional(),
                include_blocked: z.boolean().optional(),
                include_unauthenticated: z.boolean().optional(),
                include_trash: z.boolean().optional(),
                senders: z.array(z.string()).optional(),
                recipients: z.array(z.string()).optional(),
                subject: z.array(z.string()).optional(),
            }).strict(),
        },
    },
    resources: {
        reads: [{ id: "agentmail/inbox", key: "$.pathParams.inbox_id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
