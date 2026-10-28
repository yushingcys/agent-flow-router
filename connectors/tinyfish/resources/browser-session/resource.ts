import { z } from "zod";
import { defineResource, Unit } from "@shared/core";
import { zBrowserSessionBody } from "../../schema/common.ts";

/**
 * tinyfish/browser-session - a rented remote browser (Browser API) the
 * caller drives over CDP. Its ops run against the provider origin,
 * `https://api.browser.tinyfish.ai`.
 *
 * USAGE (design D39): one ESTIMATED line, $0.002 per minute of WALL-CLOCK
 * session lifetime (https://www.tinyfish.ai/pricing, checked 2026-10-27) -
 * idle time costs the same as active use. The meter is the vendor's own
 * per-session usage record (`GET /usage?session_id=`), clipped to the
 * reconcile window and priced on exact duration (TinyFish publishes no
 * rounding rule). A DAY settle clock: the inactivity timeout caps at
 * 86,400 s, so most sessions settle on the release tail, and a long one
 * still settles daily.
 */
export default defineResource({
    slug: "browser-session",
    meta: {
        displayName: "Remote Browser Session",
        summary: "A remote browser you drive over CDP, billed per minute.",
        description: "A remote TinyFish browser owned by this workspace, " +
            "driven over CDP (Playwright connectOverCDP or any CDP " +
            "client). $0.002 per minute of wall-clock lifetime, idle " +
            "included, until it is released or its inactivity timeout " +
            "ends it.",
        docsUrl: "https://docs.tinyfish.ai/browser-api/reference",
    },
    data: z.strictObject({}),
    // No `release` input shape: the release endpoint takes the session id
    // as a PATH param, and the catalog shape must ride the endpoint body.
    inputs: { create: zBrowserSessionBody },
    usage: {
        period: { unit: "DAY", count: 1, anchor: "CREATION_TIME" },
        lines: {
            minutes: {
                price: {
                    unit: Unit.MINUTE,
                    consumes: { credit: "default", amount: 0.002 },
                },
            },
        },
    },
    reconcileUsage: {
        minutes: {
            everyMs: 3_600_000,
            /**
             * Session minutes inside the cumulative window, from the
             * vendor's usage record. A running session (no end_time yet)
             * counts up to the window end. ISO timestamps are parsed by
             * hand: `Date` is not a closed-term global.
             */
            get: async ({ data, utils }) => {
                const $ = utils.json;
                const res = await utils.http({
                    method: "GET",
                    path: "/usage",
                    queryParams: { session_id: data.resource.externalId },
                });
                if (res.status < 200 || res.status >= 300) {
                    throw new Error(
                        "tinyfish browser usage read failed with HTTP " +
                            res.status,
                    );
                }
                const start = $.optionalStr(res.body, "$.items[0].start_time");
                if (start === undefined) {
                    // never "$0": a session we provisioned has a record, so
                    // its absence is a read problem - settle late
                    throw new Error(
                        "tinyfish browser usage has no record for session " +
                            data.resource.externalId,
                    );
                }
                // end_time is null while the session runs
                const ended = $.optionalGet(res.body, "$.items[0].end_time");
                const end = typeof ended === "string"
                    ? ended
                    : data.window.endIso;
                const [startMs, endMs, fromMs, toMs] = [
                    start,
                    end,
                    data.window.startIso,
                    data.window.endIso,
                ].map((iso) => {
                    const m =
                        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|([+-])(\d{2}):(\d{2}))$/
                            .exec(iso);
                    if (m === null) {
                        throw new Error("unparseable timestamp " + iso);
                    }
                    const month = Number(m[2]);
                    const year = Number(m[1]) - (month <= 2 ? 1 : 0);
                    const era = Math.floor(year / 400);
                    const yoe = year - era * 400;
                    const doy = Math.floor(
                        (153 * (month + (month > 2 ? -3 : 9)) + 2) / 5,
                    ) + Number(m[3]) - 1;
                    const doe = yoe * 365 + Math.floor(yoe / 4) -
                        Math.floor(yoe / 100) + doy;
                    const days = era * 146_097 + doe - 719_468;
                    const offsetMin = m[8] === "Z"
                        ? 0
                        : (m[9] === "-" ? -1 : 1) *
                            (Number(m[10]) * 60 + Number(m[11]));
                    return days * 86_400_000 + Number(m[4]) * 3_600_000 +
                        (Number(m[5]) - offsetMin) * 60_000 +
                        Number(m[6]) * 1000 +
                        Math.round(Number(m[7] ?? "0") * 1000);
                });
                const minutes = Math.max(
                    0,
                    Math.min(endMs, toMs) - Math.max(startMs, fromMs),
                ) / 60_000;
                return {
                    consumes: { credit: "default", amount: minutes * 0.002 },
                };
            },
        },
    },
    lifecycle: {
        /** Aliveness from the vendor's usage record: `ended` (or no
         *  record at all) is inactive; `created` / `running` is alive.
         *  Other non-2xx THROWS - never conclude from a flaky read. */
        verify: async ({ data, utils }) => {
            const res = await utils.http({
                method: "GET",
                path: "/usage",
                queryParams: { session_id: data.resource.externalId },
            });
            if (res.status < 200 || res.status >= 300) {
                throw new Error(
                    "tinyfish browser session verify failed with HTTP " +
                        res.status,
                );
            }
            const status = utils.json.optionalStr(
                res.body,
                "$.items[0].status",
            );
            if (status === undefined) {
                return { active: false, inactiveReason: "no_usage_record" };
            }
            return status === "ended"
                ? { active: false, inactiveReason: "ended" }
                : { active: true };
        },
        /** `DELETE /{sessionId}` - idempotent upstream (an ended session
         *  still answers 204); 404 means it is already gone. */
        release: async ({ data, utils }) => {
            const res = await utils.http({
                method: "DELETE",
                path: "/" + encodeURIComponent(data.resource.externalId),
            });
            if (
                !(res.status >= 200 && res.status < 300) && res.status !== 404
            ) {
                throw new Error(
                    "tinyfish browser session release failed with HTTP " +
                        res.status,
                );
            }
            return { released: true };
        },
    },
});
