import { z } from "zod";
import { defineEndpoint, type Json, UsageModelKind } from "@shared/core";

/**
 * `POST /v0/inboxes` - create an inbox, the agentmail/inbox CREATES anchor.
 *
 * A lifecycle rather than a relay for two reasons, both pooled-tenancy:
 *   - an inbox on a custom domain must be on a domain THIS workspace owns
 *     (or a subdomain of one) - checked against the ownership window,
 *     since the domain name is not the domain resource's id;
 *   - `client_id` is AgentMail's org-wide idempotency key, so a caller's
 *     value could return ANOTHER tenant's inbox. It is not accepted; the
 *     run id is sent instead, which also makes activity retries converge.
 */
export const zCreateInboxBody = z.object({
    username: z.string().optional().describe(
        "The address's local part. Random when omitted.",
    ),
    domain: z.string().optional().describe(
        "A custom domain you own (or a subdomain of one). Omit for " +
            "@agentmail.to.",
    ),
    display_name: z.string().optional().describe(
        'Shown as "Display Name <username@domain.com>".',
    ),
    status: z.enum(["active", "paused"]).optional().describe(
        "`paused` creates the inbox paused.",
    ),
    metadata: z.record(
        z.string(),
        z.union([z.string(), z.number(), z.boolean()]),
    ).optional(),
}).strict();

export default defineEndpoint({
    meta: {
        displayName: "Create Email Inbox",
        summary:
            "Create a real email inbox your agent owns; the address comes back as output.email.",
        description: "Create a real email inbox owned by this workspace. " +
            "Pick the address's username (random when omitted) and, " +
            "optionally, one of your custom domains; the address comes " +
            "back as `email` and doubles as the `inbox_id` every other " +
            "AgentMail endpoint takes. The inbox renews at $1/month until " +
            "you release it.",
        docsUrl: "https://docs.agentmail.to/api-reference/inboxes/create",
        categories: ["agentic-email"],
        notes: [
            "Running this SPENDS MONEY: $1 for the first month, then " +
            "$1/month until released.",
            "Not a list - to SEE the inboxes you already own, use " +
            "/list-inboxes (free).",
        ],
    },
    endpoint: "/create-inboxes",
    request: { method: "POST", path: "/v0/inboxes" },
    input: { schema: { body: zCreateInboxBody } },
    resources: {
        provisions: [{
            id: "agentmail/inbox",
            /** A 2xx with no readable id is never "nothing provisioned"
             *  for a paid create - the throw is the host's alarm. */
            seed: ({ data, utils }) => {
                const $ = utils.json;
                const id = $.optionalStr(data.output, "$.inbox_id");
                if (id === undefined) {
                    throw new Error(
                        "agentmail returned success but no inbox_id",
                    );
                }
                const email = $.optionalStr(data.output, "$.email") ?? id;
                const displayName = $.optionalStr(
                    data.output,
                    "$.display_name",
                );
                return {
                    resource: "agentmail/inbox",
                    externalId: id,
                    identifier: email,
                    data: {
                        email,
                        ...(displayName !== undefined
                            ? { display_name: displayName }
                            : {}),
                    },
                };
            },
        }],
        /** Keyless: unlocks the window the custom-domain check reads. */
        reads: [{ id: "agentmail/domain" }],
    },
    usage: {
        model: {
            kind: UsageModelKind.PER_CALL,
            label: "inbox + first month",
            consumes: { credit: "default", amount: 1 },
        },
    },
    lifecycle: {
        start: async ({ data, utils }) => {
            const body = data.input.body!;
            if (body.domain !== undefined) {
                const wanted = body.domain.toLowerCase();
                const owned = await utils.resources.owned({
                    resource: "agentmail/domain",
                });
                const names = owned.map((row) =>
                    String(
                        utils.json.optionalStr(row.data, "$.domain") ?? "",
                    ).toLowerCase()
                );
                const ok = names.some((name) =>
                    name !== "" &&
                    (wanted === name || wanted.endsWith("." + name))
                );
                if (!ok) {
                    return {
                        kind: "COMPLETED",
                        httpStatus: 404,
                        output: {
                            error: "not_found",
                            message: "domain " + body.domain + " is not " +
                                "owned by this workspace - register it " +
                                "with /create-domains first",
                        } as Json,
                    };
                }
            }
            const res = await utils.http({
                method: "POST",
                path: "/v0/inboxes",
                body: { ...body, client_id: data.run.runId },
            });
            return {
                kind: "COMPLETED",
                httpStatus: res.status,
                output: res.body,
            };
        },
    },
});
