import { defineEndpoint, UsageModelKind } from "@shared/core";
import { inboxAttachmentPath } from "../../../schema/common.ts";

/**
 * `GET /v0/inboxes/{inbox_id}/threads/{id}/attachments/{attachment_id}` -
 * get a thread attachment's metadata and a time-limited download URL (not
 * the bytes).
 *
 * Inbox-scoped on purpose: the org-wide `/v0/threads` routes span every
 * tenant of the pooled organization, so `inbox_id` is required and gated.
 */
export default defineEndpoint({
    meta: {
        displayName: "Get Thread Attachment",
        summary:
            "Get a thread attachment's metadata and a time-limited download URL (not the bytes).",
        description:
            "Get one attachment from any message of a conversation in one " +
            "of your inboxes: filename, size, content type and a time-" +
            "limited `download_url` (plus `text_url` for extracted text). " +
            "The bytes themselves are not returned.",
        docsUrl:
            "https://docs.agentmail.to/api-reference/inboxes/threads/get-attachment",
        categories: ["agentic-email"],
    },
    endpoint: "/threads/{id}/attachments/{attachment_id}",
    request: {
        method: "GET",
        path: "/v0/inboxes/{inbox_id}/threads/{id}/attachments/{attachment_id}",
    },
    input: {
        schema: { pathParams: inboxAttachmentPath("thread") },
    },
    resources: {
        reads: [{ id: "agentmail/inbox", key: "$.pathParams.inbox_id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
