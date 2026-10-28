import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zDuckduckgoNewsQuery } from "./schema/inputs.ts";

/** GET /search?engine=duckduckgo_news */
export default defineEndpoint({
    meta: {
        displayName: "Search Private News",
        summary: "Search DuckDuckGo News for recent articles on a topic.",
        description:
            "Search DuckDuckGo News for recent articles on a topic. Runs SerpApi's `duckduckgo_news` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/duckduckgo-news-api",
        categories: ["news-search"],
    },
    endpoint: "/duckduckgo/news",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zDuckduckgoNewsQuery.extend({
                engine: zEngine("duckduckgo_news"),
            }),
        },
    },
});
