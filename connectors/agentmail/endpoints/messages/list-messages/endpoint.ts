import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import {
    zInboxPath,
    zLabels,
    zPaging,
    zWindow,
} from "../../../schema/common.ts";

/**
 * `GET /v0/inboxes/{inbox_id}/messages` - list the messages of an inbox you
 * own, newest first, with label and time filters.
 */
export default defineEndpoint({
    meta: {
        displayName: "List Email Messages",
        summary:
            "List the messages of an inbox you own, newest first, with label and time filters.",
        description:
            "List the messages in one of your inboxes, newest first, as " +
            "summaries (sender, recipients, subject, preview, labels, " +
            "timestamps). Filter by label, time window, sender, recipient " +
            "or subject; spam, blocked and trashed mail is excluded unless " +
            "asked for. Page with `page_token`.",
        docsUrl:
            "https://docs.agentmail.to/api-reference/inboxes/messages/list",
        categories: ["agentic-email"],
    },
    endpoint: "/list-messages",
    request: { method: "GET", path: "/v0/inboxes/{inbox_id}/messages" },
    input: {
        schema: {
            pathParams: zInboxPath,
            queryParams: z.object({
                ...zPaging,
                ...zWindow,
                labels: zLabels.optional().describe(
                    "Only messages with every label.",
                ),
                ascending: z.boolean().optional().describe("Oldest first."),
                include_spam: z.boolean().optional(),
                include_blocked: z.boolean().optional(),
                include_unauthenticated: z.boolean().optional(),
                include_trash: z.boolean().optional(),
                from: z.array(z.string()).optional().describe(
                    "Sender contains each value (substring match).",
                ),
                to: z.array(z.string()).optional().describe(
                    "Recipients (to, cc or bcc) contain each value.",
                ),
                subject: z.array(z.string()).optional().describe(
                    "Subject contains each value.",
                ),
            }).strict(),
        },
    },
    resources: {
        reads: [{ id: "agentmail/inbox", key: "$.pathParams.inbox_id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
