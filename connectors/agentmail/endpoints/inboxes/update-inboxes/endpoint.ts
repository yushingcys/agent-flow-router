import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zInboxId } from "../../../schema/common.ts";

/**
 * `PATCH /v0/inboxes/{id}` - change an inbox's display name (the address
 * itself is immutable).
 */
export default defineEndpoint({
    meta: {
        displayName: "Update Email Inbox",
        summary:
            "Change an inbox's display name (the address itself is immutable).",
        description:
            "Update an inbox you own: its display name (shown as `Display " +
            "Name <address>`), pause or resume it, or merge keys into its " +
            "metadata (a null value removes a key). The address itself " +
            "never changes.",
        docsUrl: "https://docs.agentmail.to/api-reference/inboxes/update",
        categories: ["agentic-email"],
    },
    endpoint: "/update-inboxes/{id}",
    request: { method: "PATCH", path: "/v0/inboxes/{id}" },
    input: {
        schema: {
            pathParams: z.object({ id: zInboxId }).strict(),
            body: z.object({
                display_name: z.string().optional().describe(
                    'Shown as "Display Name <username@domain.com>".',
                ),
                status: z.enum(["active", "paused"]).optional().describe(
                    "`paused` stops the inbox sending and receiving mail.",
                ),
                metadata: z.record(
                    z.string(),
                    z.union([z.string(), z.number(), z.boolean()]).nullable(),
                ).optional().describe(
                    "Keys to merge into the metadata; null removes a key.",
                ),
            }).strict(),
        },
    },
    resources: { updates: [{ id: "agentmail/inbox", key: "$.pathParams.id" }] },
    usage: { model: { kind: UsageModelKind.FREE } },
});
