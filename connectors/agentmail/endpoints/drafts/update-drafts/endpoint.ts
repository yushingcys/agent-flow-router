import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import {
    inboxItemPath,
    zLabels,
    zSendAttachment,
} from "../../../schema/common.ts";

/**
 * `PATCH /v0/inboxes/{inbox_id}/drafts/{id}` - edit an existing draft:
 * recipients, subject, body, attachments, labels, or schedule.
 */
export default defineEndpoint({
    meta: {
        displayName: "Update Email Draft",
        summary:
            "Edit an existing draft: recipients, subject, body, attachments, labels, or schedule.",
        description:
            "Edit a draft in one of your inboxes: recipients, subject, " +
            "bodies, attachments (add or remove by id), labels, or its " +
            "scheduled send time. A null clears a field.",
        docsUrl:
            "https://docs.agentmail.to/api-reference/inboxes/drafts/update",
        categories: ["agentic-email"],
    },
    endpoint: "/update-drafts/{id}",
    request: { method: "PATCH", path: "/v0/inboxes/{inbox_id}/drafts/{id}" },
    input: {
        schema: {
            pathParams: inboxItemPath("draft"),
            body: z.object({
                reply_to: z.array(z.string()).nullable().optional(),
                to: z.array(z.string()).nullable().optional(),
                cc: z.array(z.string()).nullable().optional(),
                bcc: z.array(z.string()).nullable().optional(),
                subject: z.string().nullable().optional(),
                text: z.string().nullable().optional(),
                html: z.string().nullable().optional(),
                add_attachments: z.array(zSendAttachment).optional(),
                remove_attachments: z.array(z.string()).optional(),
                add_labels: zLabels.optional(),
                remove_labels: zLabels.optional(),
                send_at: z.string().nullable().optional(),
            }).strict(),
        },
    },
    resources: {
        uses: [{ id: "agentmail/inbox", key: "$.pathParams.inbox_id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
