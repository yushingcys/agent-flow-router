import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleTrendsTrendingNowQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_trends_trending_now */
export default defineEndpoint({
    meta: {
        displayName: "List Trending Searches",
        summary:
            "List what is trending on Google Search right now in a country.",
        description:
            "List what is trending on Google Search right now in a country. Runs SerpApi's `google_trends_trending_now` engine. Requires `geo`.",
        docsUrl: "https://serpapi.com/google-trends-trending-now",
        categories: ["seo"],
    },
    endpoint: "/google/trends-trending-now",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleTrendsTrendingNowQuery.extend({
                engine: zEngine("google_trends_trending_now"),
            }),
        },
    },
});
