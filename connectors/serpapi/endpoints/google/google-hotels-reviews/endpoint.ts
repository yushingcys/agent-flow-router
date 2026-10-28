import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleHotelsReviewsQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_hotels_reviews */
export default defineEndpoint({
    meta: {
        displayName: "Read Hotel Reviews",
        summary: "Get guest reviews of one Google Hotels property.",
        description:
            "Get guest reviews of one Google Hotels property. Runs SerpApi's `google_hotels_reviews` engine. Requires `property_token`.",
        docsUrl: "https://serpapi.com/google-hotels-reviews-api",
        categories: ["hotels"],
    },
    endpoint: "/google/hotels-reviews",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleHotelsReviewsQuery.extend({
                engine: zEngine("google_hotels_reviews"),
            }),
        },
    },
});
