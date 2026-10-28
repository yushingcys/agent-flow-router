import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGooglePlayProductQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_play_product */
export default defineEndpoint({
    meta: {
        displayName: "Get Play Listing",
        summary:
            "Get one Google Play listing with details, ratings, and reviews.",
        description:
            "Get one Google Play listing with details, ratings, and reviews. Runs SerpApi's `google_play_product` engine. Requires `product_id`, `store`.",
        docsUrl: "https://serpapi.com/google-play-product-api",
        categories: ["app-stores"],
    },
    endpoint: "/google-play/product",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGooglePlayProductQuery.extend({
                engine: zEngine("google_play_product"),
            }),
        },
    },
});
