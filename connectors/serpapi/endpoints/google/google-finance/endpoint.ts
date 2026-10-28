import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleFinanceQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_finance */
export default defineEndpoint({
    meta: {
        displayName: "Quote Stock Ticker",
        summary:
            "Get a Google Finance quote, chart, news, and financials for a ticker.",
        description:
            "Get a Google Finance quote, chart, news, and financials for a ticker. Runs SerpApi's `google_finance` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/google-finance-api",
        categories: ["equities"],
    },
    endpoint: "/google/finance",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleFinanceQuery.extend({
                engine: zEngine("google_finance"),
            }),
        },
    },
});
