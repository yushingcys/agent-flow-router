import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zInboxPath, zOutboundFields } from "../../../schema/common.ts";

/**
 * `POST /v0/inboxes/{inbox_id}/messages/send` - send an email from an inbox
 * you own; returns the new message and thread ids.
 */
export default defineEndpoint({
    meta: {
        displayName: "Send Email Message",
        summary:
            "Send an email from an inbox you own; returns the new message and thread ids.",
        description:
            "Send a new email from one of your inboxes to one or more " +
            "recipients, with a text and/or HTML body, cc, bcc, attachments" +
            " (base64 or URL) and labels. Returns the sent message's " +
            "`message_id` and `thread_id`; replies land in the same thread.",
        docsUrl:
            "https://docs.agentmail.to/api-reference/inboxes/messages/send",
        categories: ["agentic-email"],
        notes: [
            "Running this SPENDS MONEY: $0.001 per send.",
        ],
    },
    endpoint: "/send-messages",
    request: { method: "POST", path: "/v0/inboxes/{inbox_id}/messages/send" },
    input: {
        schema: {
            pathParams: zInboxPath,
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
