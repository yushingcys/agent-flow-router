import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import { inboxItemPath, zOutboundFields } from "../../../schema/common.ts";

/**
 * `POST /v0/inboxes/{inbox_id}/messages/{id}/reply` - reply to a message in
 * an inbox you own; set replyAll to answer every recipient.
 */
export default defineEndpoint({
    meta: {
        displayName: "Reply to Email Message",
        summary:
            "Reply to a message in an inbox you own; set replyAll to answer every recipient.",
        description:
            "Reply to a message in one of your inboxes. The reply is " +
            "threaded under the original; set `reply_all` to answer every " +
            "recipient, or override `to`. Returns the reply's `message_id` " +
            "and `thread_id`.",
        docsUrl:
            "https://docs.agentmail.to/api-reference/inboxes/messages/reply",
        categories: ["agentic-email"],
        notes: [
            "Running this SPENDS MONEY: $0.001 per reply.",
        ],
    },
    endpoint: "/reply-messages/{id}",
    request: {
        method: "POST",
        path: "/v0/inboxes/{inbox_id}/messages/{id}/reply",
    },
    input: {
        schema: {
            pathParams: inboxItemPath("message"),
            body: z.object({
                ...zOutboundFields,
                reply_all: z.boolean().optional().describe(
                    "Reply to all recipients of the original message.",
                ),
            }).strict(),
        },
    },
    resources: {
        uses: [{ id: "agentmail/inbox", key: "$.pathParams.inbox_id" }],
    },
    usage: {
        model: {
            kind: UsageModelKind.PER_CALL,
            label: "email",
            consumes: { credit: "default", amount: 0.001 },
        },
    },
});
