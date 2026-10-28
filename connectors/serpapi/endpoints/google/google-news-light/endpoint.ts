import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleNewsLightQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_news_light */
export default defineEndpoint({
    meta: {
        displayName: "Fast News Search",
        summary: "Get fast, lightweight Google News results for a query.",
        description:
            "Get fast, lightweight Google News results for a query. Runs SerpApi's `google_news_light` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/google-news-light-api",
        categories: ["news-search"],
    },
    endpoint: "/google/news-light",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleNewsLightQuery.extend({
                engine: zEngine("google_news_light"),
            }),
        },
    },
});
