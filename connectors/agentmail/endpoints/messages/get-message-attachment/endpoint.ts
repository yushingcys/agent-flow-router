import { defineEndpoint, UsageModelKind } from "@shared/core";
import { inboxAttachmentPath } from "../../../schema/common.ts";

/**
 * `GET /v0/inboxes/{inbox_id}/messages/{id}/attachments/{attachment_id}` -
 * get a time-limited download URL for one attachment of a message in an
 * inbox you own.
 */
export default defineEndpoint({
    meta: {
        displayName: "Get Message Attachment",
        summary:
            "Get a time-limited download URL for one attachment of a message in an inbox you own.",
        description:
            "Get one attachment of a message in an inbox you own: filename," +
            " size, content type, and a time-limited `download_url` (plus " +
            "`text_url` with extracted text for PDF, Word, Excel and text " +
            "files). The bytes themselves are not returned.",
        docsUrl:
            "https://docs.agentmail.to/api-reference/inboxes/messages/get-attachment",
        categories: ["agentic-email"],
    },
    endpoint: "/messages/{id}/attachments/{attachment_id}",
    request: {
        method: "GET",
        path:
            "/v0/inboxes/{inbox_id}/messages/{id}/attachments/{attachment_id}",
    },
    input: {
        schema: { pathParams: inboxAttachmentPath("message") },
    },
    resources: {
        reads: [{ id: "agentmail/inbox", key: "$.pathParams.inbox_id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
