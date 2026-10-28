import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleProductQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_product */
export default defineEndpoint({
    meta: {
        displayName: "Get Product Offers",
        summary:
            "Get one Google Shopping product page: stores, prices, specs, and reviews.",
        description:
            "Get one Google Shopping product page: stores, prices, specs, and reviews. Runs SerpApi's `google_product` engine.",
        docsUrl: "https://serpapi.com/google-product-api",
        categories: ["google-shopping"],
    },
    endpoint: "/google/product",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleProductQuery.extend({
                engine: zEngine("google_product"),
            }),
        },
    },
});
