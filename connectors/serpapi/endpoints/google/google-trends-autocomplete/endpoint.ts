import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleTrendsAutocompleteQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_trends_autocomplete */
export default defineEndpoint({
    meta: {
        displayName: "Resolve Trend Topics",
        summary: "Resolve a term to Google Trends topics and their ids.",
        description:
            "Resolve a term to Google Trends topics and their ids. Runs SerpApi's `google_trends_autocomplete` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/google-trends-autocomplete",
        categories: ["seo"],
    },
    endpoint: "/google/trends-autocomplete",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleTrendsAutocompleteQuery.extend({
                engine: zEngine("google_trends_autocomplete"),
            }),
        },
    },
});
