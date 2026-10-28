import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleTrendsQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_trends */
export default defineEndpoint({
    meta: {
        displayName: "Measure Search Interest",
        summary:
            "Get Google Trends interest over time, by region, and related queries.",
        description:
            "Get Google Trends interest over time, by region, and related queries. Runs SerpApi's `google_trends` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/google-trends-api",
        categories: ["seo"],
    },
    endpoint: "/google/trends",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleTrendsQuery.extend({
                engine: zEngine("google_trends"),
            }),
        },
    },
});
