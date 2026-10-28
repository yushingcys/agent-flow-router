import { defineEndpoint, UsageModelKind } from "@shared/core";
import { inboxItemPath } from "../../../schema/common.ts";

/**
 * `GET /v0/inboxes/{inbox_id}/messages/{id}` - read one message from an
 * inbox you own: headers, body and attachment metadata.
 */
export default defineEndpoint({
    meta: {
        displayName: "Get Email Message",
        summary:
            "Read one message from an inbox you own: headers, body and attachment metadata.",
        description:
            "Read one message in full: sender and recipients, subject, the " +
            "text and HTML bodies, `extracted_text` (the new content with " +
            "quoted history stripped), labels, authentication results and " +
            "attachment metadata.",
        docsUrl: "https://docs.agentmail.to/api-reference/inboxes/messages/get",
        categories: ["agentic-email"],
    },
    endpoint: "/messages/{id}",
    request: { method: "GET", path: "/v0/inboxes/{inbox_id}/messages/{id}" },
    input: {
        schema: { pathParams: inboxItemPath("message") },
    },
    resources: {
        reads: [{ id: "agentmail/inbox", key: "$.pathParams.inbox_id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
