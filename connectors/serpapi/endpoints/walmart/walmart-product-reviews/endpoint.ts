import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zWalmartProductReviewsQuery } from "./schema/inputs.ts";

/** GET /search?engine=walmart_product_reviews */
export default defineEndpoint({
    meta: {
        displayName: "Read Walmart Reviews",
        summary: "Get customer reviews of one Walmart product.",
        description:
            "Get customer reviews of one Walmart product. Runs SerpApi's `walmart_product_reviews` engine. Requires `product_id`.",
        docsUrl: "https://serpapi.com/walmart-product-reviews-api",
        categories: ["walmart"],
    },
    endpoint: "/walmart/product-reviews",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zWalmartProductReviewsQuery.extend({
                engine: zEngine("walmart_product_reviews"),
            }),
        },
    },
});
