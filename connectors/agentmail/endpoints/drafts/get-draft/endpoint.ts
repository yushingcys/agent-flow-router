import { defineEndpoint, UsageModelKind } from "@shared/core";
import { inboxItemPath } from "../../../schema/common.ts";

/**
 * `GET /v0/inboxes/{inbox_id}/drafts/{id}` - get one draft from one of your
 * inboxes (recipients, subject, body, attachments).
 */
export default defineEndpoint({
    meta: {
        displayName: "Get Email Draft",
        summary:
            "Get one draft from one of your inboxes (recipients, subject, body, attachments).",
        description:
            "Read one draft in full: recipients, subject, text and HTML " +
            "bodies, attachments, labels, what it replies to or forwards, " +
            "and its send status and schedule.",
        docsUrl: "https://docs.agentmail.to/api-reference/inboxes/drafts/get",
        categories: ["agentic-email"],
    },
    endpoint: "/drafts/{id}",
    request: { method: "GET", path: "/v0/inboxes/{inbox_id}/drafts/{id}" },
    input: {
        schema: { pathParams: inboxItemPath("draft") },
    },
    resources: {
        reads: [{ id: "agentmail/inbox", key: "$.pathParams.inbox_id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
