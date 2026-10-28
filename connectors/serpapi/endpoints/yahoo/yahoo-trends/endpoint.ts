import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zYahooTrendsQuery } from "./schema/inputs.ts";

/** GET /search?engine=yahoo_trends */
export default defineEndpoint({
    meta: {
        displayName: "List Yahoo Trends",
        summary: "List the topics trending on Yahoo right now.",
        description:
            "List the topics trending on Yahoo right now. Runs SerpApi's `yahoo_trends` engine.",
        docsUrl: "https://serpapi.com/yahoo-trends-api",
        categories: ["seo"],
    },
    endpoint: "/yahoo/trends",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zYahooTrendsQuery.extend({
                engine: zEngine("yahoo_trends"),
            }),
        },
    },
});
