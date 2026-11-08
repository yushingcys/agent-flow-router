import { defineProvider, presets, Unit, UsageModelKind } from "@shared/core";

/**
 * Keenable (keenable.ai) — web search and page fetch for AI agents.
 * Two synchronous REST endpoints against `https://api.keenable.ai/v1`,
 * auth `X-API-Key`.
 *
 * The catalog surface is the authenticated pair (`POST /v1/search`,
 * `GET /v1/fetch`). The keyless `/public` twins exist to evaluate the
 * API without an account (shared per-IP pool, `X-Keenable-Title`, no
 * credits) and are not exposed — design D1.
 *
 * Billing: Keenable meters authenticated usage in credits, one per
 * search or fetch by default, and every 2xx `/v1/search` and `/v1/fetch`
 * body ends with `usage: {sku, amount, credits, paid}`
 * (https://docs.keenable.ai/credits, checked 2026-11-08). `paid` says
 * which balance the credits came from: `false` is the organization's
 * free monthly allowance (100,000 requests), `true` purchased credits.
 * Only purchased credits cost the key holder anything, so the model
 * counts PURCHASED credits: the evidence counts 0 for an allowance call,
 * and the provider `consolidate` claims the vendor's own `credits` for a
 * paid one and strips the `usage` envelope, which describes our account,
 * from the output. One pool `default`.
 */
export default defineProvider({
    name: "keenable",
    meta: {
        displayName: "Keenable",
        summary: "Low-latency web search and clean page fetch for AI agents.",
        description: "Web search and page fetch built for AI agents — " +
            "ranked results that already carry extracted page text, plus a " +
            "fetch that returns any URL as clean markdown, from the index " +
            "or live from the source. Filter search by site, publication " +
            "date, and when Keenable indexed the page; fetch can " +
            "optionally run an extraction instruction instead of " +
            "returning the whole page.",
        homepageUrl: "https://keenable.ai",
        docsUrl: "https://docs.keenable.ai",
        categories: ["web-search"],
    },
    auth: { inject: presets.auth.header("X-API-Key") },
    request: { baseUrl: "https://api.keenable.ai" },
    timeouts: { requestMs: 30_000, runMs: 30_000 },
    usage: {
        /** THE credit system (design D26): Keenable's native meter is
         *  credits, one per search (either mode, D3) or fetch (indexed
         *  or live, D4). */
        credits: { default: { label: "Keenable credits" } },
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.CREDIT,
            label: "purchased credits",
            description: "credits drawn from purchased credits; a call " +
                "served from the free monthly allowance draws none",
            consumes: { credit: "default", amount: 1 },
        },
        /** The hold promises one paid credit. */
        estimate: () => ({ counts: { CREDIT: 1 } }),
        /** 0 for a call served from the free allowance (`usage.paid`
         *  false) or a non-object body, else 1. */
        evidence: ({ data, utils }) => {
            const body = data.output;
            if (
                typeof body !== "object" || body === null ||
                Array.isArray(body)
            ) {
                return { counts: { CREDIT: 0 } };
            }
            const paid = utils.json.optionalGet(body, "$.usage.paid");
            return { counts: { CREDIT: paid === false ? 0 : 1 } };
        },
        /** The vendor's OWN claim (design D27): `usage.credits` of a
         *  purchased-credit call; an allowance call claims nothing, so the
         *  fold (0) settles. The envelope leaves the output either way. */
        consolidate: ({ data, utils }) => {
            const { value, rest } = utils.json.pluck(data.output, "$.usage");
            const paid = utils.json.optionalGet(value ?? null, "$.paid");
            const credits = utils.json.optionalGet(
                value ?? null,
                "$.credits",
            );
            return {
                credits: {
                    ...(paid !== false && typeof credits === "number"
                        ? { default: credits }
                        : {}),
                },
                output: rest,
            };
        },
    },
});
