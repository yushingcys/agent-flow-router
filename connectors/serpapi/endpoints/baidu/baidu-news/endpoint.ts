import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zBaiduNewsQuery } from "./schema/inputs.ts";

/** GET /search?engine=baidu_news */
export default defineEndpoint({
    meta: {
        displayName: "Search Baidu News",
        summary: "Search Baidu News for Chinese-language articles on a topic.",
        description:
            "Search Baidu News for Chinese-language articles on a topic. Runs SerpApi's `baidu_news` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/baidu-news-api",
        categories: ["news-search"],
    },
    endpoint: "/baidu/news",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zBaiduNewsQuery.extend({
                engine: zEngine("baidu_news"),
            }),
        },
    },
});
