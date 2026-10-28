import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zDuckduckgoSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=duckduckgo */
export default defineEndpoint({
    meta: {
        displayName: "Search DuckDuckGo",
        summary: "Run a DuckDuckGo search and get parsed organic results.",
        description:
            "Run a DuckDuckGo search and get parsed organic results. Runs SerpApi's `duckduckgo` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/duckduckgo-search-api",
        categories: ["web-search"],
    },
    endpoint: "/duckduckgo/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zDuckduckgoSearchQuery.extend({
                engine: zEngine("duckduckgo"),
            }),
        },
    },
});
