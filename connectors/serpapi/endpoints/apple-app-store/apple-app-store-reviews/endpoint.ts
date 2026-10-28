import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zAppleAppStoreReviewsQuery } from "./schema/inputs.ts";

/** GET /search?engine=apple_reviews */
export default defineEndpoint({
    meta: {
        displayName: "Read iOS App Reviews",
        summary: "Get user reviews of one App Store app.",
        description:
            "Get user reviews of one App Store app. Runs SerpApi's `apple_reviews` engine. Requires `product_id`.",
        docsUrl: "https://serpapi.com/apple-reviews",
        categories: ["app-stores"],
    },
    endpoint: "/apple-app-store/reviews",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zAppleAppStoreReviewsQuery.extend({
                engine: zEngine("apple_reviews"),
            }),
        },
    },
});
