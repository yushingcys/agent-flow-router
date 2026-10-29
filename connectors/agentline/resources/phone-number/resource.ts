import { z } from "zod";
import { defineResource } from "@shared/core";

/**
 * agentline/phone-number - a rented US or Canadian number with its AI
 * persona. The externalId is AgentLine's number id (`num_...`); the
 * persona's agent id is stored ONLY as an internal pointer
 * (`externalRefs.agent`) - persona content is read live.
 *
 * USAGE: one FIXED line, $3 per MONTH, CREATION_TIME-anchored
 * (AgentLine's price for a number beyond the plan allowance, read
 * 2026-10-29). The first month is charged by /provision-numbers itself.
 */
export default defineResource({
    slug: "phone-number",
    meta: {
        displayName: "Phone Number",
        summary: "A rented phone number with its AI voice persona.",
        description: "A real US or Canadian phone number owned by this " +
            "workspace, with an AI voice persona answering and placing " +
            "its calls. $3/month; release any time - the number stays " +
            "usable until its paid-through date.",
        docsUrl: "https://docs.agentline.cloud/guides/numbers",
    },
    data: z.strictObject({
        phoneNumber: z.string().optional(),
        country: z.string(),
        externalRefs: z.strictObject({ agent: z.string().min(1) }),
    }),
    usage: {
        period: { unit: "MONTH", count: 1, anchor: "CREATION_TIME" },
        lines: {
            rent: { consumes: { credit: "default", amount: 3 } },
        },
    },
    lifecycle: {
        /** 404 or a released status is gone (an irreversible verdict);
         *  any other non-2xx throws so the charge attempt retries. */
        verify: async ({ data, utils }) => {
            const res = await utils.http({
                method: "GET",
                path: "/v1/numbers/" +
                    encodeURIComponent(data.resource.externalId),
            });
            if (res.status === 404) {
                return { active: false, inactiveReason: "http_404" };
            }
            if (res.status < 200 || res.status >= 300) {
                throw new Error(
                    "agentline number verify failed with HTTP " + res.status,
                );
            }
            const status = utils.json.optionalStr(res.body, "$.status");
            return status === "released"
                ? { active: false, inactiveReason: "released" }
                : { active: true };
        },
        /**
         * `POST /v1/numbers/{id}/release`, then delete the persona (its
         * agent). 404 is done; a 409 is done only when the number reads
         * back released - AgentLine also answers 409 while the number is
         * on a call or a lease is active, which must retry.
         */
        release: async ({ data, utils }) => {
            const path = "/v1/numbers/" +
                encodeURIComponent(data.resource.externalId);
            const rel = await utils.http({
                method: "POST",
                path: path + "/release",
            });
            if (rel.status === 409) {
                const read = await utils.http({ method: "GET", path });
                const status = utils.json.optionalStr(read.body, "$.status");
                if (read.status !== 404 && status !== "released") {
                    throw new Error(
                        "agentline number release refused (409, status " +
                            String(status) + ")",
                    );
                }
            } else if (
                !(rel.status >= 200 && rel.status < 300) && rel.status !== 404
            ) {
                throw new Error(
                    "agentline number release failed with HTTP " + rel.status,
                );
            }
            const del = await utils.http({
                method: "DELETE",
                path: "/v1/agents/" +
                    encodeURIComponent(data.resource.data.externalRefs.agent),
            });
            if (
                !(del.status >= 200 && del.status < 300) && del.status !== 404
            ) {
                throw new Error(
                    "agentline persona delete failed with HTTP " + del.status +
                        " on number release",
                );
            }
            return { released: true };
        },
        /** Re-read the number; the agent pointer follows upstream. */
        refresh: async ({ data, utils }) => {
            const $ = utils.json;
            const res = await utils.http({
                method: "GET",
                path: "/v1/numbers/" +
                    encodeURIComponent(data.resource.externalId),
            });
            if (res.status === 404) return { active: false };
            if (res.status < 200 || res.status >= 300) {
                throw new Error(
                    "agentline number refresh failed with HTTP " + res.status,
                );
            }
            const phoneNumber = $.optionalStr(res.body, "$.phone_number") ??
                data.resource.data.phoneNumber;
            return {
                active: $.optionalStr(res.body, "$.status") !== "released",
                patch: {
                    country: $.optionalStr(res.body, "$.country") ??
                        data.resource.data.country,
                    externalRefs: {
                        agent: $.optionalStr(res.body, "$.agent_id") ??
                            data.resource.data.externalRefs.agent,
                    },
                    ...(phoneNumber !== undefined ? { phoneNumber } : {}),
                },
            };
        },
    },
});
