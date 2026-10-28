import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zSearchIndexSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=search_index */
export default defineEndpoint({
    meta: {
        displayName: "Query Web Index",
        summary:
            "Query a fast LLM-first index of web pages, places, and products.",
        description:
            "Query a fast LLM-first index of web pages, places, and products. Runs SerpApi's `search_index` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/search-index-api",
        categories: ["web-search"],
    },
    endpoint: "/search-index/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zSearchIndexSearchQuery.extend({
                engine: zEngine("search_index"),
            }),
        },
    },
});
