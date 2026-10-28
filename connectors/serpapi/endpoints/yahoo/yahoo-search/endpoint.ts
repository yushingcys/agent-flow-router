import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zYahooSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=yahoo */
export default defineEndpoint({
    meta: {
        displayName: "Search Yahoo Web",
        summary:
            "Run a Yahoo web search and get parsed organic results and ads.",
        description:
            "Run a Yahoo web search and get parsed organic results and ads. Runs SerpApi's `yahoo` engine. Requires `p`.",
        docsUrl: "https://serpapi.com/yahoo-search-api",
        categories: ["web-search"],
    },
    endpoint: "/yahoo/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zYahooSearchQuery.extend({ engine: zEngine("yahoo") }),
        },
    },
});
