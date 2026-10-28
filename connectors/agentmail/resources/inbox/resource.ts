import { z } from "zod";
import { defineResource } from "@shared/core";

/**
 * agentmail/inbox - an email inbox owned by this workspace. The externalId
 * is AgentMail's `inbox_id`, which IS the email address.
 *
 * USAGE: one FIXED line, $1 per month, CREATION_TIME-anchored (Monid's
 * "Email inbox" resource, from $1.00 per month, read 2026-10-27). The first
 * month is charged by /create-inboxes itself.
 *
 * AgentMail deletes an inbox immediately and permanently, so
 * /release-inboxes deletes it upstream in the run; `release` below is then
 * the host's idempotent confirmation (404 counts as done).
 */
export default defineResource({
    slug: "inbox",
    meta: {
        displayName: "Email inbox",
        summary: "A dedicated email inbox for your agent.",
        description: "A real email address owned by this workspace that " +
            "sends and receives mail through AgentMail. $1/month; release " +
            "any time - releasing deletes the inbox and all its mail at " +
            "once.",
        docsUrl: "https://docs.agentmail.to/inboxes",
    },
    data: z.strictObject({
        email: z.string(),
        display_name: z.string().optional(),
    }),
    usage: {
        period: { unit: "MONTH", count: 1, anchor: "CREATION_TIME" },
        lines: {
            rent: { consumes: { credit: "default", amount: 1 } },
        },
    },
    lifecycle: {
        /** 404 means gone (an irreversible verdict); any other non-2xx
         *  throws so the charge attempt retries instead of concluding. */
        verify: async ({ data, utils }) => {
            const res = await utils.http({
                method: "GET",
                path: "/v0/inboxes/" +
                    encodeURIComponent(data.resource.externalId),
            });
            if (res.status === 404) {
                return { active: false, inactiveReason: "http_404" };
            }
            if (res.status < 200 || res.status >= 300) {
                throw new Error(
                    "agentmail inbox verify failed with HTTP " + res.status,
                );
            }
            return { active: true };
        },
        release: async ({ data, utils }) => {
            const res = await utils.http({
                method: "DELETE",
                path: "/v0/inboxes/" +
                    encodeURIComponent(data.resource.externalId),
            });
            if (
                !(res.status >= 200 && res.status < 300) &&
                res.status !== 404
            ) {
                throw new Error(
                    "agentmail inbox release failed with HTTP " + res.status,
                );
            }
            return { released: true };
        },
        refresh: async ({ data, utils }) => {
            const $ = utils.json;
            const res = await utils.http({
                method: "GET",
                path: "/v0/inboxes/" +
                    encodeURIComponent(data.resource.externalId),
            });
            if (res.status === 404) return { active: false };
            if (res.status < 200 || res.status >= 300) {
                throw new Error(
                    "agentmail inbox refresh failed with HTTP " + res.status,
                );
            }
            const displayName = $.optionalStr(res.body, "$.display_name");
            return {
                active: true,
                patch: {
                    email: $.optionalStr(res.body, "$.email") ??
                        data.resource.data.email,
                    ...(displayName !== undefined
                        ? { display_name: displayName }
                        : {}),
                },
            };
        },
    },
});
