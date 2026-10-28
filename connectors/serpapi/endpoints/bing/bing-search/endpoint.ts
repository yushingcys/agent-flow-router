import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zBingSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=bing */
export default defineEndpoint({
    meta: {
        displayName: "Search Bing Web",
        summary:
            "Run a Bing web search and get parsed organic results and ads.",
        description:
            "Run a Bing web search and get parsed organic results and ads. Runs SerpApi's `bing` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/bing-search-api",
        categories: ["web-search"],
    },
    endpoint: "/bing/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zBingSearchQuery.extend({ engine: zEngine("bing") }),
        },
    },
});
