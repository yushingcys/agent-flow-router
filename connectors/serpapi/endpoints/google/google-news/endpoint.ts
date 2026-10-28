import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleNewsQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_news */
export default defineEndpoint({
    meta: {
        displayName: "Browse News Stories",
        summary: "Search Google News by query, topic, publication, or story.",
        description:
            "Search Google News by query, topic, publication, or story. Runs SerpApi's `google_news` engine.",
        docsUrl: "https://serpapi.com/google-news-api",
        categories: ["news-search"],
    },
    endpoint: "/google/news",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleNewsQuery.extend({
                engine: zEngine("google_news"),
            }),
        },
    },
});
