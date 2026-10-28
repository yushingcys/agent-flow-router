import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleMapsReviewsQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_maps_reviews */
export default defineEndpoint({
    meta: {
        displayName: "Read Place Reviews",
        summary:
            "Get the Google Maps reviews of one place, newest or most relevant.",
        description:
            "Get the Google Maps reviews of one place, newest or most relevant. Runs SerpApi's `google_maps_reviews` engine.",
        docsUrl: "https://serpapi.com/google-maps-reviews-api",
        categories: ["maps", "company-reviews"],
    },
    endpoint: "/google/maps-reviews",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleMapsReviewsQuery.extend({
                engine: zEngine("google_maps_reviews"),
            }),
        },
    },
});
