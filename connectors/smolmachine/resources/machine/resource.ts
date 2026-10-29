import { z } from "zod";
import { defineResource, Unit } from "@shared/core";

/**
 * smolmachine/machine - a persistent smol cloud microVM owned by this
 * workspace. The externalId is smol's machine id (`mach-...`).
 *
 * USAGE (design D39): one ESTIMATED line on a CALENDAR month clock -
 * smol bills per calendar month, and `GET /v1/machines/{id}/usage` is
 * that machine's cost "so far this billing period". The meter is the
 * vendor's OWN per-line cost in micro-dollars (base + cpu + memory + disk
 * + egress; exec is metered at $0 and the plan's monthly fee is
 * account-level, so neither is read), passed through 1:1: the display
 * card is "$1 per 1,000,000 vendor micros". smol documents a mid-life
 * read as a lower bound of the settled figure, which the period-boundary
 * and release-tail reads converge on; the per-machine usage route keeps
 * answering for 30 days after deletion, so the post-teardown tail reads
 * normally.
 */
export default defineResource({
    slug: "machine",
    meta: {
        displayName: "Linux Machine",
        summary: "A persistent Linux microVM sandbox, metered while it exists.",
        description: "A smol cloud microVM owned by this workspace: its " +
            "filesystem persists across commands and stop/start until it " +
            "is deleted. Metered at smol's published rates - $0.04 per " +
            "running machine-hour, $0.05 per vCPU-hour, $0.0162 per " +
            "GB-hour of memory, $0.0001 per GB-hour of disk (also while " +
            "stopped), $0.05 per GB of egress.",
        docsUrl: "https://smolmachines.com/pricing",
    },
    data: z.strictObject({
        name: z.string().optional(),
        image: z.string(),
        cpus: z.number().optional(),
        memoryMb: z.number().optional(),
        diskGb: z.number().optional(),
        networkMode: z.string().optional(),
    }),
    usage: {
        period: { unit: "MONTH", count: 1, anchor: "CALENDAR" },
        lines: {
            metered: {
                price: {
                    unit: Unit.CREDIT,
                    every: 1_000_000,
                    consumes: { credit: "default", amount: 1 },
                },
            },
        },
    },
    reconcileUsage: {
        metered: {
            everyMs: 3_600_000,
            /**
             * The machine's cost this calendar month, in dollars. The
             * vendor meter only answers for its CURRENT period, so a read
             * whose window started in another month (a boundary settle or
             * release tail that ran after the month rolled over) cannot be
             * answered from it and THROWS - settle late, never a silent $0.
             */
            get: async ({ data, utils }) => {
                const $ = utils.json;
                const res = await utils.http({
                    method: "GET",
                    path: "/v1/machines/" +
                        encodeURIComponent(data.resource.externalId) +
                        "/usage",
                });
                if (res.status < 200 || res.status >= 300) {
                    throw new Error(
                        "smolmachine usage read failed with HTTP " +
                            res.status,
                    );
                }
                const from = $.optionalStr(res.body, "$.from");
                if (
                    from === undefined ||
                    from.slice(0, 7) !== data.window.startIso.slice(0, 7)
                ) {
                    // ponytail: month-prefix match assumes UTC RFC3339 on
                    // both sides; parse to ms if smol ever answers offsets
                    throw new Error(
                        "smolmachine usage period " + String(from) +
                            " does not cover the window starting " +
                            data.window.startIso,
                    );
                }
                const micros = [
                    "baseMicros",
                    "cpuMicros",
                    "memoryMicros",
                    "diskMicros",
                    "egressMicros",
                ].map((key) => $.optionalNum(res.body, "$.cost." + key) ?? 0)
                    .reduce((sum, n) => sum + n, 0);
                return {
                    consumes: { credit: "default", amount: micros / 1_000_000 },
                };
            },
        },
    },
    lifecycle: {
        /** 404 means gone (deleted by us, or by its own ttlSeconds /
         *  ephemeral rule); any other non-2xx throws so the check retries
         *  instead of concluding. */
        verify: async ({ data, utils }) => {
            const res = await utils.http({
                method: "GET",
                path: "/v1/machines/" +
                    encodeURIComponent(data.resource.externalId),
            });
            if (res.status === 404) {
                return { active: false, inactiveReason: "http_404" };
            }
            if (res.status < 200 || res.status >= 300) {
                throw new Error(
                    "smolmachine verify failed with HTTP " + res.status,
                );
            }
            return { active: true };
        },
        /** `DELETE /v1/machines/{id}` stops and removes it; 404 means
         *  /machines/{id}/delete (or a ttl) already did. */
        release: async ({ data, utils }) => {
            const res = await utils.http({
                method: "DELETE",
                path: "/v1/machines/" +
                    encodeURIComponent(data.resource.externalId),
            });
            if (
                !(res.status >= 200 && res.status < 300) && res.status !== 404
            ) {
                throw new Error(
                    "smolmachine release failed with HTTP " + res.status,
                );
            }
            return { released: true };
        },
    },
});
