import { defineProvider, UsageModelKind } from "@shared/core";

/**
 * Best Buy Products API (bestbuyapis.github.io/api-documentation) -
 * Best Buy's own catalog: product search, one SKU's price and
 * availability, and which nearby stores stock it.
 *
 * Keys are self-serve at developer.bestbuy.com. Auth is the `apiKey`
 * QUERY parameter (no header form is documented), so `deno task record`
 * keeps it in the recorded URL: scrub it by hand.
 *
 * Rate card: the API is free, metered by calls against the key's quota
 * (developer.bestbuy.com: 50,000 calls per day, 5 per second), with no
 * cost in the response. One pool `default` = API calls, PER_CALL 1.
 */
export default defineProvider({
    name: "bestbuy",
    meta: {
        displayName: "Best Buy",
        summary: "Best Buy's product catalog: search, prices, online " +
            "and in-store availability.",
        description: "Search Best Buy's catalog by keyword, UPC, model " +
            "number or any product attribute, read one SKU's regular and " +
            "sale price, online and in-store availability, and list the " +
            "stores near a ZIP code that can sell it today, from Best " +
            "Buy's official Products and Stores APIs.",
        homepageUrl: "https://developer.bestbuy.com",
        docsUrl: "https://bestbuyapis.github.io/api-documentation/",
        categories: ["bestbuy"],
        notes: [
            "A key allows 50,000 calls per day and 5 per second; past " +
            "either, or with a bad key, the answer is a 403.",
            'Errors come back as `{errorCode, errorMessage}`, e.g. "We ' +
            'were unable to validate your API Key."',
            "Prices are US dollars; `show` picks the returned attributes " +
            "(comma-separated, e.g. sku,name,salePrice,onlineAvailability).",
        ],
    },
    auth: {
        inject: ({ data }) => ({
            ...data.request,
            query: { ...data.request.query, apiKey: [data.params.apiKey] },
        }),
    },
    request: { baseUrl: "https://api.bestbuy.com/v1" },
    timeouts: { requestMs: 30_000, runMs: 60_000 },
    usage: {
        credits: { default: { label: "Best Buy API calls" } },
        model: {
            kind: UsageModelKind.PER_CALL,
            label: "API call",
            consumes: { credit: "default", amount: 1 },
        },
    },
    output: {
        fromError: ({ data, utils }) => {
            const message = utils.json.optionalGet(
                data.output,
                "$.errorMessage",
            );
            return {
                message: typeof message === "string" && message !== ""
                    ? message
                    : "Best Buy API error",
                raw: data.output,
            };
        },
    },
});
