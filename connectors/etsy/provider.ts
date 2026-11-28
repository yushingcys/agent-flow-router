import { defineProvider, presets, UsageModelKind } from "@shared/core";

/**
 * Etsy Open API v3 (developers.etsy.com/documentation) - public
 * marketplace reads with an app's API key; no OAuth needed for active
 * listings.
 *
 * Keys come from registering an app at etsy.com/developers/your-apps.
 * Auth is the `x-api-key` header, whose value Etsy requires as
 * `keystring:shared_secret` (securitySchemes.api_key in Etsy's OpenAPI
 * document), so the one `apiKey` credential holds that whole string.
 *
 * Rate card: the API is free, metered by calls against the app's
 * per-second and per-day limits, with no cost in the response. One pool
 * `default` = API calls, PER_CALL 1.
 */
export default defineProvider({
    name: "etsy",
    meta: {
        displayName: "Etsy",
        summary: "Search Etsy's active marketplace listings.",
        description: "Search active Etsy listings by keyword, price " +
            "range, taxonomy, shop location and ships-to country, with " +
            "each listing's title, price, quantity, tags, shop and URL, " +
            "from Etsy's official Open API v3.",
        homepageUrl: "https://www.etsy.com/developers",
        docsUrl: "https://developers.etsy.com/documentation/",
        categories: ["etsy"],
        notes: [
            'Errors come back as `{error: "..."}`; a bad key or shared ' +
            "secret is a 403.",
            "Prices are Money objects `{amount, divisor, currency_code}`: " +
            "the price is amount / divisor.",
        ],
    },
    auth: { inject: presets.auth.header("x-api-key") },
    request: { baseUrl: "https://openapi.etsy.com/v3/application" },
    timeouts: { requestMs: 30_000, runMs: 60_000 },
    usage: {
        credits: { default: { label: "Etsy API calls" } },
        model: {
            kind: UsageModelKind.PER_CALL,
            label: "API call",
            consumes: { credit: "default", amount: 1 },
        },
    },
    output: {
        fromError: ({ data, utils }) => {
            const message = utils.json.optionalGet(data.output, "$.error");
            return {
                message: typeof message === "string" && message !== ""
                    ? message
                    : "Etsy API error",
                raw: data.output,
            };
        },
    },
});
