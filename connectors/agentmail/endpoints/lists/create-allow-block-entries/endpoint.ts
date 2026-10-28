import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zInboxId, zListCoords } from "../../../schema/common.ts";

/**
 * `POST /v0/inboxes/{inbox_id}/lists/{direction}/{type}` - add an email
 * address or domain to an allow or block list for your mail.
 */
export default defineEndpoint({
    meta: {
        displayName: "Add Allow/Block Rule",
        summary:
            "Add an email address or domain to an allow or block list for your mail.",
        description:
            "Add an email address or a whole domain to an allow or block " +
            "list of an inbox you own - for example block a sender, or " +
            "allow only replies from one domain.",
        docsUrl: "https://docs.agentmail.to/api-reference/inboxes/lists/create",
        categories: ["agentic-email"],
    },
    endpoint: "/create-allow-block-entries",
    request: {
        method: "POST",
        path: "/v0/inboxes/{inbox_id}/lists/{direction}/{type}",
    },
    input: {
        schema: {
            pathParams: z.object({
                inbox_id: zInboxId,
                ...zListCoords,
            }).strict(),
            body: z.object({
                entry: z.string().min(1).describe(
                    "The email address or domain to add.",
                ),
                reason: z.string().optional(),
            }).strict(),
        },
    },
    resources: {
        uses: [{ id: "agentmail/inbox", key: "$.pathParams.inbox_id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
