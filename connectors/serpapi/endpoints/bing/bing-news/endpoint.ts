import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zBingNewsQuery } from "./schema/inputs.ts";

/** GET /search?engine=bing_news */
export default defineEndpoint({
    meta: {
        displayName: "Search Bing News",
        summary: "Search Bing News for recent articles on a topic.",
        description:
            "Search Bing News for recent articles on a topic. Runs SerpApi's `bing_news` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/bing-news-api",
        categories: ["news-search"],
    },
    endpoint: "/bing/news",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zBingNewsQuery.extend({
                engine: zEngine("bing_news"),
            }),
        },
    },
});
