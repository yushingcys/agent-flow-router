import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zHomeDepotProductReviewsQuery } from "./schema/inputs.ts";

/** GET /search?engine=home_depot_product_reviews */
export default defineEndpoint({
    meta: {
        displayName: "Read Home Depot Reviews",
        summary: "Get customer reviews of one Home Depot product.",
        description:
            "Get customer reviews of one Home Depot product. Runs SerpApi's `home_depot_product_reviews` engine. Requires `product_id`.",
        docsUrl: "https://serpapi.com/home-depot-product-reviews",
        categories: ["homedepot"],
    },
    endpoint: "/home-depot/product-reviews",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zHomeDepotProductReviewsQuery.extend({
                engine: zEngine("home_depot_product_reviews"),
            }),
        },
    },
});
