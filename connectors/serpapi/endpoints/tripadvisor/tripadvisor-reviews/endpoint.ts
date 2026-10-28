import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zTripadvisorReviewsQuery } from "./schema/inputs.ts";

/** GET /search?engine=tripadvisor_reviews */
export default defineEndpoint({
    meta: {
        displayName: "Read Traveler Reviews",
        summary: "Get traveler reviews of one Tripadvisor place.",
        description:
            "Get traveler reviews of one Tripadvisor place. Runs SerpApi's `tripadvisor_reviews` engine. Requires `place_id`.",
        docsUrl: "https://serpapi.com/tripadvisor-reviews-api",
        categories: ["maps", "company-reviews"],
    },
    endpoint: "/tripadvisor/reviews",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zTripadvisorReviewsQuery.extend({
                engine: zEngine("tripadvisor_reviews"),
            }),
        },
    },
});
