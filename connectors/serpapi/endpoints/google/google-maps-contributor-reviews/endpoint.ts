import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleMapsContributorReviewsQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_maps_contributor_reviews */
export default defineEndpoint({
    meta: {
        displayName: "List Reviewer History",
        summary: "List every Google Maps review written by one contributor.",
        description:
            "List every Google Maps review written by one contributor. Runs SerpApi's `google_maps_contributor_reviews` engine. Requires `contributor_id`.",
        docsUrl: "https://serpapi.com/google-maps-contributor-reviews-api",
        categories: ["maps", "company-reviews"],
    },
    endpoint: "/google/maps-contributor-reviews",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleMapsContributorReviewsQuery.extend({
                engine: zEngine("google_maps_contributor_reviews"),
            }),
        },
    },
});
