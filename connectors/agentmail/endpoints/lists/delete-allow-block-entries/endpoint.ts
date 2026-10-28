import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zInboxId, zListCoords } from "../../../schema/common.ts";

/**
 * `DELETE /v0/inboxes/{inbox_id}/lists/{direction}/{type}/{entry}` - remove
 * an email address or domain from an allow or block list.
 */
export default defineEndpoint({
    meta: {
        displayName: "Remove Allow/Block Rule",
        summary:
            "Remove an email address or domain from an allow or block list.",
        description:
            "Remove an email address or domain from an allow or block list " +
            "of an inbox you own.",
        docsUrl: "https://docs.agentmail.to/api-reference/inboxes/lists/delete",
        categories: ["agentic-email"],
    },
    endpoint: "/delete-allow-block-entries",
    request: {
        method: "DELETE",
        path: "/v0/inboxes/{inbox_id}/lists/{direction}/{type}/{entry}",
    },
    input: {
        schema: {
            pathParams: z.object({
                inbox_id: zInboxId,
                ...zListCoords,
                entry: z.string().min(1).describe(
                    "The email address or domain to remove.",
                ),
            }).strict(),
        },
    },
    resources: {
        uses: [{ id: "agentmail/inbox", key: "$.pathParams.inbox_id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
