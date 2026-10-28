import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleAdsQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_ads */
export default defineEndpoint({
    meta: {
        displayName: "Collect Sponsored Results",
        summary:
            "Collect the paid ads Google shows for a keyword and location.",
        description:
            "Collect the paid ads Google shows for a keyword and location. Runs SerpApi's `google_ads` engine. Requires `q`, `location`.",
        docsUrl: "https://serpapi.com/google-ads-api",
        categories: ["seo"],
    },
    endpoint: "/google/ads",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleAdsQuery.extend({
                engine: zEngine("google_ads"),
            }),
        },
    },
});
