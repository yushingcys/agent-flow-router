import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zInboxPath, zPaging, zWindow } from "../../../schema/common.ts";

/**
 * `GET /v0/inboxes/{inbox_id}/messages/search` - full-text search the
 * messages of an inbox you own, best match first.
 */
export default defineEndpoint({
    meta: {
        displayName: "Search Email Messages",
        summary:
            "Full-text search the messages of an inbox you own, best match first.",
        description:
            "Full-text search over the messages in one of your inboxes " +
            "(senders, subjects and bodies), best match first, with " +
            "highlighted snippets. Narrow by time window and page with " +
            "`page_token`.",
        docsUrl:
            "https://docs.agentmail.to/api-reference/inboxes/messages/search",
        categories: ["agentic-email"],
    },
    endpoint: "/search-messages",
    request: { method: "GET", path: "/v0/inboxes/{inbox_id}/messages/search" },
    input: {
        schema: {
            pathParams: zInboxPath,
            queryParams: z.object({
                q: z.string().min(1).describe("The full-text query."),
                ...zPaging,
                ...zWindow,
            }).strict(),
        },
    },
    resources: {
        reads: [{ id: "agentmail/inbox", key: "$.pathParams.inbox_id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
