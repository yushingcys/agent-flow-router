import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import { inboxItemPath, zLabelOrLabels } from "../../../schema/common.ts";

/**
 * `POST /v0/inboxes/{inbox_id}/drafts/{id}/send` - send a draft as-is;
 * returns the sent message's message_id and thread_id.
 */
export default defineEndpoint({
    meta: {
        displayName: "Send Email Draft",
        summary:
            "Send a draft as-is; returns the sent message's message_id and thread_id.",
        description:
            "Send a draft from one of your inboxes exactly as it stands, " +
            "optionally adjusting the sent message's labels. The draft " +
            "becomes a sent message; returns its `message_id` and " +
            "`thread_id`.",
        docsUrl: "https://docs.agentmail.to/api-reference/inboxes/drafts/send",
        categories: ["agentic-email"],
        notes: [
            "Running this SPENDS MONEY: $0.001 per send.",
        ],
    },
    endpoint: "/send-drafts/{id}",
    request: {
        method: "POST",
        path: "/v0/inboxes/{inbox_id}/drafts/{id}/send",
    },
    input: {
        schema: {
            pathParams: inboxItemPath("draft"),
            body: z.object({
                add_labels: zLabelOrLabels.optional(),
                remove_labels: zLabelOrLabels.optional(),
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
