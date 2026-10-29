import { defineProvider, presets, UsageModelKind } from "@shared/core";

/**
 * Crunchbase (crunchbase.com) - company, investor and funding data via the
 * Crunchbase Enterprise API v4 (`https://api.crunchbase.com/v4/data`),
 * authenticated by the `X-cb-user-key` header (docs api-essentials).
 *
 * Monid lists this provider as a parse.bot scraper with snake_case tool
 * names; each doc keeps Monid's path as its `endpoint` id and calls the
 * real v4 route (design D22): entity lookups, single-card lookups
 * (`founders` / `jobs` / `raised_funding_rounds` ...), and the POST search
 * API.
 *
 * BILLING: the Enterprise API is a licensed subscription, not a metered
 * one - no response reports a cost and there is no credit balance, only
 * rate (200/min) and concurrency (3) limits per key. Every successful
 * request counts as one call against the `default` pool; the broker card
 * prices it.
 */
export default defineProvider({
    name: "crunchbase",
    meta: {
        displayName: "Crunchbase",
        summary:
            "Company, investor and funding data: organization profiles, key people, funding rounds and investors.",
        description: "Crunchbase Enterprise API v4 - search organizations " +
            "and investors with field predicates (industry, location, " +
            "funding totals, last funding type, investor type, rank), look " +
            "up an organization's profile, its current and past team, and " +
            "the funding rounds it raised, and look up an investor's " +
            "profile and portfolio statistics.",
        homepageUrl: "https://www.crunchbase.com",
        docsUrl: "https://data.crunchbase.com/docs/api-essentials",
        categories: ["company-enrichment", "funding-data"],
        notes: [
            "The fields and cards a key can read depend on its licensed API " +
            "package (Firmographics, Core / Advanced Financials, " +
            "Predictions & Insights); unlicensed fields are omitted or " +
            "answer 403.",
            "Entities are addressed by UUID or permalink (the slug in a " +
            "crunchbase.com URL, e.g. 'tesla-motors'); the search endpoints " +
            "return both.",
            "Limits per key: 200 requests per minute and 3 in flight at " +
            "once; beyond either the API answers 429.",
        ],
    },
    auth: { inject: presets.auth.header("X-cb-user-key") },
    request: {
        baseUrl: "https://api.crunchbase.com/v4/data",
        headers: { Accept: "application/json" },
    },
    timeouts: { requestMs: 60_000, runMs: 60_000 },
    usage: {
        credits: { default: { label: "Crunchbase API requests" } },
        model: {
            kind: UsageModelKind.PER_CALL,
            label: "request",
            consumes: { credit: "default", amount: 1 },
        },
    },
    output: {
        /** Crunchbase errors answer a list `[{status, code, message}]`
         *  (live 401: `LA401 Unauthorized user_key`); a bare object is
         *  read the same way. */
        fromError: ({ data, utils }) => {
            const first = Array.isArray(data.output)
                ? data.output[0] ?? null
                : data.output;
            const message = utils.json.optionalGet(first, "$.message");
            const code = utils.json.optionalGet(first, "$.code");
            return {
                message: typeof message === "string" && message !== ""
                    ? message
                    : "Crunchbase API error",
                ...(typeof code === "string" ? { error_code: code } : {}),
                raw: data.output,
            };
        },
    },
});
