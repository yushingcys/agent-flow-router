import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import {
    zInboxPath,
    zLabels,
    zPaging,
    zWindow,
} from "../../../schema/common.ts";

/**
 * `GET /v0/inboxes/{inbox_id}/drafts` - list the drafts in one of your
 * inboxes, with filters and pagination.
 */
export default defineEndpoint({
    meta: {
        displayName: "List Email Drafts",
        summary:
            "List the drafts in one of your inboxes, with filters and pagination.",
        description:
            "List the drafts in one of your inboxes - recipients, subject, " +
            "preview, labels, send status and scheduled send time. Filter " +
            "by label and time window; page with `page_token`.",
        docsUrl: "https://docs.agentmail.to/api-reference/inboxes/drafts/list",
        categories: ["agentic-email"],
    },
    endpoint: "/list-drafts",
    request: { method: "GET", path: "/v0/inboxes/{inbox_id}/drafts" },
    input: {
        schema: {
            pathParams: zInboxPath,
            queryParams: z.object({
                ...zPaging,
                ...zWindow,
                labels: zLabels.optional(),
                ascending: z.boolean().optional(),
            }).strict(),
        },
    },
    resources: {
        reads: [{ id: "agentmail/inbox", key: "$.pathParams.inbox_id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
