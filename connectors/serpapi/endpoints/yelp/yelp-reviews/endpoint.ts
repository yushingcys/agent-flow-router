import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zYelpReviewsQuery } from "./schema/inputs.ts";

/** GET /search?engine=yelp_reviews */
export default defineEndpoint({
    meta: {
        displayName: "Read Yelp Reviews",
        summary: "Get customer reviews of one Yelp business.",
        description:
            "Get customer reviews of one Yelp business. Runs SerpApi's `yelp_reviews` engine. Requires `place_id`.",
        docsUrl: "https://serpapi.com/yelp-reviews-api",
        categories: ["maps", "company-reviews"],
    },
    endpoint: "/yelp/reviews",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zYelpReviewsQuery.extend({
                engine: zEngine("yelp_reviews"),
            }),
        },
    },
});
