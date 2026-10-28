import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zInboxId, zListCoords, zPaging } from "../../../schema/common.ts";

/**
 * `GET /v0/inboxes/{inbox_id}/lists/{direction}/{type}` - list the entries
 * on one of your allow or block lists.
 */
export default defineEndpoint({
    meta: {
        displayName: "List Allow/Block Rules",
        summary: "List the entries on one of your allow or block lists.",
        description:
            "List the email addresses and domains on one allow or block " +
            "list of an inbox you own. `direction` picks the mail the list " +
            "governs (send, receive or reply), `type` picks allow or block.",
        docsUrl: "https://docs.agentmail.to/api-reference/inboxes/lists/list",
        categories: ["agentic-email"],
    },
    endpoint: "/list-allow-block-entries",
    request: {
        method: "GET",
        path: "/v0/inboxes/{inbox_id}/lists/{direction}/{type}",
    },
    input: {
        schema: {
            pathParams: z.object({
                inbox_id: zInboxId,
                ...zListCoords,
            }).strict(),
            queryParams: z.object({ ...zPaging }).strict(),
        },
    },
    resources: {
        reads: [{ id: "agentmail/inbox", key: "$.pathParams.inbox_id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
