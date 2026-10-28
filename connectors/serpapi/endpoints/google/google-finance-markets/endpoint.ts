import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleFinanceMarketsQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_finance_markets */
export default defineEndpoint({
    meta: {
        displayName: "List Market Indexes",
        summary: "List world stock market indexes with prices and moves.",
        description:
            "List world stock market indexes with prices and moves. Runs SerpApi's `google_finance_markets` engine. Requires `trend`.",
        docsUrl: "https://serpapi.com/google-finance-markets",
        categories: ["equities"],
    },
    endpoint: "/google/finance-markets",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleFinanceMarketsQuery.extend({
                engine: zEngine("google_finance_markets"),
            }),
        },
    },
});
