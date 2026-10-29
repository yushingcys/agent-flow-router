import { defineProvider } from "@shared/core";

/**
 * The Companies API (thecompaniesapi.com) - company enrichment and search
 * over 50M+ companies. Synchronous JSON endpoints on
 * `https://api.thecompaniesapi.com/v2` (OpenAPI at `GET /v2/openapi`),
 * authenticated by `Authorization: Basic <api token>` (docs
 * api/authentication - the token itself, not a base64 user:password).
 *
 * Monid lists this provider as a parse.bot scraper with snake_case tool
 * names; each doc keeps Monid's path as its `endpoint` id and calls the
 * vendor's real route (design D22).
 *
 * BILLING: one prepaid credit pool (`default`). Billed responses report
 * the vendor's own draw at `meta.cost` (with the team balance beside it at
 * `meta.credits`): the provider `consolidate` claims `meta.cost` and
 * strips both, since the balance is OUR account's. Responses without a
 * meter (email patterns, a bare array) fall back to the derived fold.
 */
export default defineProvider({
    name: "the-companies-api",
    meta: {
        displayName: "The Companies API",
        summary:
            "Firmographic company data: domain enrichment, company search, industries and email patterns.",
        description: "The Companies API - firmographic data on 50M+ " +
            "companies with 80+ data points each: enrich a company from its " +
            "domain, search and count companies with segmentation " +
            "conditions (industry, country, size, revenue, technologies, " +
            "NAICS/SIC codes), search the industry taxonomy, find the email " +
            "patterns a company uses, and fetch an AI-generated business " +
            "context for a company.",
        homepageUrl: "https://www.thecompaniesapi.com",
        docsUrl: "https://www.thecompaniesapi.com/api",
        categories: ["company-enrichment"],
        notes: [
            "Credits are drawn only on successful responses; the response's " +
            "own meta.cost settles the bill when present.",
        ],
    },
    auth: {
        inject: ({ data }) => ({
            ...data.request,
            headers: {
                ...data.request.headers,
                Authorization: "Basic " + data.params.apiKey,
            },
        }),
    },
    request: {
        baseUrl: "https://api.thecompaniesapi.com",
        headers: { Accept: "application/json" },
    },
    timeouts: { requestMs: 60_000, runMs: 60_000 },
    usage: {
        credits: { default: { label: "The Companies API credits" } },
        /** The vendor's claim (design D27): `meta.cost`; `meta.credits`
         *  (our remaining balance) is stripped in the same pass. */
        consolidate: ({ data, utils }) => {
            const cost = utils.json.pluck(data.output, "$.meta.cost");
            const balance = utils.json.pluck(cost.rest, "$.meta.credits");
            return {
                credits: {
                    ...(typeof cost.value === "number"
                        ? { default: cost.value }
                        : {}),
                },
                output: balance.rest,
            };
        },
    },
    output: {
        /** Errors: `{error: {code, message, type}}` (docs api/errors) or
         *  the OpenAPI 404 shape `{messages, status}`. */
        fromError: ({ data, utils }) => {
            const message = utils.json.optionalGet(
                data.output,
                "$.error.message",
            ) ?? utils.json.optionalGet(data.output, "$.messages");
            const type = utils.json.optionalGet(data.output, "$.error.type");
            return {
                message: typeof message === "string" && message !== ""
                    ? message
                    : "The Companies API error",
                ...(typeof type === "string" ? { error_code: type } : {}),
                raw: data.output,
            };
        },
    },
});
