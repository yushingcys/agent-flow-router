import { z } from "zod";
import { defineResource } from "@shared/core";

/**
 * agentmail/domain - a custom sending domain owned by this workspace. The
 * externalId is AgentMail's `domain_id`; the domain name rides in `data` so
 * /create-inboxes can check an inbox's domain against the owned set.
 *
 * USAGE: one FIXED line, $1 per month, CREATION_TIME-anchored (Monid's
 * "Custom email domain" resource, read 2026-10-27). The first month is
 * charged by /create-domains itself.
 *
 * Deletion is immediate upstream, so /release-domains deletes in the run
 * and `release` below is the host's idempotent confirmation.
 */
export default defineResource({
    slug: "domain",
    meta: {
        displayName: "Custom email domain",
        summary: "Send and receive agent email from your own domain.",
        description: "A domain you control, registered with AgentMail so " +
            "inboxes can send and receive as name@your-domain. Needs the " +
            "returned DNS records at your registrar. $1/month; releasing " +
            "deletes it at once.",
        docsUrl: "https://docs.agentmail.to/custom-domains",
    },
    data: z.strictObject({
        domain: z.string(),
        status: z.string().optional(),
    }),
    usage: {
        period: { unit: "MONTH", count: 1, anchor: "CREATION_TIME" },
        lines: {
            rent: { consumes: { credit: "default", amount: 1 } },
        },
    },
    lifecycle: {
        verify: async ({ data, utils }) => {
            const res = await utils.http({
                method: "GET",
                path: "/v0/domains/" +
                    encodeURIComponent(data.resource.externalId),
            });
            if (res.status === 404) {
                return { active: false, inactiveReason: "http_404" };
            }
            if (res.status < 200 || res.status >= 300) {
                throw new Error(
                    "agentmail domain verify failed with HTTP " + res.status,
                );
            }
            return { active: true };
        },
        release: async ({ data, utils }) => {
            const res = await utils.http({
                method: "DELETE",
                path: "/v0/domains/" +
                    encodeURIComponent(data.resource.externalId),
            });
            if (
                !(res.status >= 200 && res.status < 300) &&
                res.status !== 404
            ) {
                throw new Error(
                    "agentmail domain release failed with HTTP " + res.status,
                );
            }
            return { released: true };
        },
        refresh: async ({ data, utils }) => {
            const $ = utils.json;
            const res = await utils.http({
                method: "GET",
                path: "/v0/domains/" +
                    encodeURIComponent(data.resource.externalId),
            });
            if (res.status === 404) return { active: false };
            if (res.status < 200 || res.status >= 300) {
                throw new Error(
                    "agentmail domain refresh failed with HTTP " + res.status,
                );
            }
            const status = $.optionalStr(res.body, "$.status");
            return {
                active: true,
                patch: {
                    domain: $.optionalStr(res.body, "$.domain") ??
                        data.resource.data.domain,
                    ...(status !== undefined ? { status } : {}),
                },
            };
        },
    },
});
