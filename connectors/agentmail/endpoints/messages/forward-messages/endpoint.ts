import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import { inboxItemPath, zOutboundFields } from "../../../schema/common.ts";

/**
 * `POST /v0/inboxes/{inbox_id}/messages/{id}/forward` - forward a message
 * from an inbox you own to new recipients.
 */
export default defineEndpoint({
    meta: {
        displayName: "Forward Email Message",
        summary: "Forward a message from an inbox you own to new recipients.",
        description:
            "Forward a message from one of your inboxes to new recipients, " +
            "optionally with your own note and extra attachments. Returns " +
            "the forwarded message's `message_id` and `thread_id`.",
        docsUrl:
            "https://docs.agentmail.to/api-reference/inboxes/messages/forward",
        categories: ["agentic-email"],
        notes: [
            "Running this SPENDS MONEY: $0.001 per forward.",
        ],
    },
    endpoint: "/forward-messages/{id}",
    request: {
        method: "POST",
        path: "/v0/inboxes/{inbox_id}/messages/{id}/forward",
    },
    input: {
        schema: {
            pathParams: inboxItemPath("message"),
            body: z.object({
                ...zOutboundFields,
                subject: z.string().optional(),
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
