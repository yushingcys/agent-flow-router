import { defineProvider, presets, UsageModelKind } from "@shared/core";

/**
 * censusdata.xyz - a hosted agent that answers plain-English US Census
 * Bureau (American Community Survey) questions from live Census API data
 * (https://censusdata.xyz/skill, OpenAPI at
 * https://censusdata.xyz/openapi.json, read 2026-10-29). Monid's slug is
 * `censusdata.xyz`; a provider name cannot carry a dot (design D1).
 *
 * Two GETs on `https://censusdata.xyz`, input as query params, auth the
 * `X-API-Key` header (the vendor also takes an `api_key` query param; the
 * header keeps the key out of recorded URLs).
 *
 * Rate card: the vendor meters `/query` calls against a per-key daily
 * allowance (free tier; higher quotas by arrangement) and reports no
 * per-call cost, so `/query` is PER_CALL 1 against pool `default`.
 * `/explore-variables` needs no key and is FREE. Query responses carry a
 * `quota: {used, limit}` block - OUR key's daily usage, not a per-call
 * meter - which consolidate strips from the output.
 */
export default defineProvider({
    name: "censusdata",
    meta: {
        displayName: "censusdata.xyz",
        summary: "Plain-English answers from live US Census (ACS) data for " +
            "any state, county, city, metro, or ZIP code.",
        description: "Ask US Census Bureau questions in plain English and " +
            "get a narrative summary plus the raw American Community " +
            "Survey records behind it: population, age, race, income, " +
            "poverty, housing, rent, commute, remote work, education, " +
            "broadband, health insurance, and 28,000+ other indicators, " +
            "for states, counties, places, metro areas, and ZIP codes, " +
            "including comparisons, rankings, and year-over-year trends.",
        homepageUrl: "https://censusdata.xyz",
        docsUrl: "https://censusdata.xyz/skill",
        categories: ["government-data"],
    },
    auth: { inject: presets.auth.header("X-API-Key") },
    request: { baseUrl: "https://censusdata.xyz" },
    // /query runs an LLM agent over several Census API calls.
    timeouts: { requestMs: 120_000, runMs: 120_000 },
    usage: {
        credits: { default: { label: "censusdata.xyz queries" } },
        model: {
            kind: UsageModelKind.PER_CALL,
            label: "query",
            consumes: { credit: "default", amount: 1 },
        },
        consolidate: ({ data, utils }) => ({
            credits: {},
            output: utils.json.pluck(data.output, "$.quota").rest,
        }),
    },
    output: {
        /** FastAPI error envelope: `{"detail": "Invalid API key."}`, or a
         *  validation array under `detail` on 422. */
        fromError: ({ data, utils }) => {
            const detail = utils.json.optionalGet(data.output, "$.detail");
            return {
                message: typeof detail === "string" && detail !== ""
                    ? detail
                    : "censusdata.xyz error",
                raw: data.output,
            };
        },
    },
});
