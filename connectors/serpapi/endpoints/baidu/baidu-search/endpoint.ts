import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zBaiduSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=baidu */
export default defineEndpoint({
    meta: {
        displayName: "Search Baidu Web",
        summary: "Run a Baidu web search and get parsed organic results.",
        description:
            "Run a Baidu web search and get parsed organic results. Runs SerpApi's `baidu` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/baidu-search-api",
        categories: ["web-search"],
    },
    endpoint: "/baidu/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zBaiduSearchQuery.extend({ engine: zEngine("baidu") }),
        },
    },
});
