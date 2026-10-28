import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zInboxId } from "../../../schema/common.ts";

/**
 * `GET /v0/inboxes/{id}` - get one of your inboxes fresh from the provider
 * (address, display name).
 */
export default defineEndpoint({
    meta: {
        displayName: "Get Email Inbox",
        summary:
            "Get one of your inboxes fresh from the provider (address, display name).",
        description:
            "Read one inbox you own straight from AgentMail: its address, " +
            "display name, status (paused or active), metadata and " +
            "timestamps. Pass the inbox id (its email address) as `id`.",
        docsUrl: "https://docs.agentmail.to/api-reference/inboxes/get",
        categories: ["agentic-email"],
    },
    endpoint: "/inboxes/{id}",
    request: { method: "GET", path: "/v0/inboxes/{id}" },
    input: {
        schema: { pathParams: z.object({ id: zInboxId }).strict() },
    },
    resources: { reads: [{ id: "agentmail/inbox", key: "$.pathParams.id" }] },
    usage: { model: { kind: UsageModelKind.FREE } },
});
