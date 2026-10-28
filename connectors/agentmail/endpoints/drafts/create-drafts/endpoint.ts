import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import {
    zInboxPath,
    zLabels,
    zSendAttachment,
} from "../../../schema/common.ts";

/**
 * `POST /v0/inboxes/{inbox_id}/drafts` - compose a draft (plain, reply, or
 * forward) in one of your inboxes; nothing is sent yet.
 */
export default defineEndpoint({
    meta: {
        displayName: "Create Email Draft",
        summary:
            "Compose a draft (plain, reply, or forward) in one of your inboxes; nothing is sent yet.",
        description:
            "Compose a draft in one of your inboxes without sending it - " +
            "for a human to review first, or to schedule with `send_at`. " +
            "Set `in_reply_to` to draft a reply or `forward_of` to draft a " +
            "forward of a message in the same inbox. Send it later with " +
            "/send-drafts/{id}.",
        docsUrl:
            "https://docs.agentmail.to/api-reference/inboxes/drafts/create",
        categories: ["agentic-email"],
    },
    endpoint: "/create-drafts",
    request: { method: "POST", path: "/v0/inboxes/{inbox_id}/drafts" },
    input: {
        schema: {
            pathParams: zInboxPath,
            body: z.object({
                labels: zLabels.optional(),
                reply_to: z.array(z.string()).optional(),
                to: z.array(z.string()).optional(),
                cc: z.array(z.string()).optional(),
                bcc: z.array(z.string()).optional(),
                subject: z.string().optional(),
                text: z.string().optional(),
                html: z.string().optional(),
                attachments: z.array(zSendAttachment).optional(),
                in_reply_to: z.string().optional().describe(
                    "Id of the message this draft replies to.",
                ),
                forward_of: z.string().optional().describe(
                    "Id of the message this draft forwards.",
                ),
                reply_all: z.boolean().optional(),
                send_at: z.string().optional().describe(
                    "ISO 8601 time to send the draft automatically.",
                ),
            }).strict(),
        },
    },
    resources: {
        uses: [{ id: "agentmail/inbox", key: "$.pathParams.inbox_id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
