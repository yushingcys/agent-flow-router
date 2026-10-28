import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import { inboxItemPath, zLabelOrLabels } from "../../../schema/common.ts";

/**
 * `PATCH /v0/inboxes/{inbox_id}/messages/{id}` - add or remove labels on a
 * message; labels are the only mutable field.
 */
export default defineEndpoint({
    meta: {
        displayName: "Update Email Message",
        summary:
            "Add or remove labels on a message; labels are the only mutable field.",
        description:
            "Add or remove labels on a message in an inbox you own - the " +
            "way an agent tracks state such as `processed` or `needs-" +
            "review`. Labels are the only field that can change.",
        docsUrl:
            "https://docs.agentmail.to/api-reference/inboxes/messages/update",
        categories: ["agentic-email"],
    },
    endpoint: "/update-messages/{id}",
    request: { method: "PATCH", path: "/v0/inboxes/{inbox_id}/messages/{id}" },
    input: {
        schema: {
            pathParams: inboxItemPath("message"),
            body: z.object({
                add_labels: zLabelOrLabels.optional(),
                remove_labels: zLabelOrLabels.optional(),
            }).strict(),
        },
    },
    resources: {
        uses: [{ id: "agentmail/inbox", key: "$.pathParams.inbox_id" }],
    },
    usage: { model: { kind: UsageModelKind.FREE } },
});
