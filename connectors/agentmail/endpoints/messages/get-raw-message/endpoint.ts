import { defineEndpoint, UsageModelKind } from "@shared/core";
import { inboxItemPath } from "../../../schema/common.ts";

/**
 * `GET /v0/inboxes/{inbox_id}/messages/{id}/raw` - get a time-limited
 * download URL for a message's original .eml file.
 */
export default defineEndpoint({
    meta: {
        displayName: "Get Raw Email Message",
        summary:
            "Get a time-limited download URL for a message's original .eml file.",
        description:
            "Get a time-limited `download_url` for the original RFC 822 " +
            "(.eml) source of a message in an inbox you own, with its size " +
            "and expiry.",
        docsUrl:
            "https://docs.agentmail.to/api-reference/inboxes/messages/get-raw",
        categories: ["agentic-email"],
    },
    endpoint: "/messages/{id}/raw",
    request: {
        method: "GET",
        path: "/v0/inboxes/{inbox_id}/messages/{id}/raw",
    },
    input: {
        schema: { pathParams: inboxItemPath("message") },
    },
    resources: {
        reads: [{ id: "agentmail/inbox", key: "$.pathParams.inbox_id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
