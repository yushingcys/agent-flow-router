import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zWalmartProductQuery } from "./schema/inputs.ts";

/** GET /search?engine=walmart_product */
export default defineEndpoint({
    meta: {
        displayName: "Get Walmart Listing",
        summary:
            "Get one Walmart product page with offers, specs, and ratings.",
        description:
            "Get one Walmart product page with offers, specs, and ratings. Runs SerpApi's `walmart_product` engine. Requires `product_id`.",
        docsUrl: "https://serpapi.com/walmart-product-api",
        categories: ["walmart"],
    },
    endpoint: "/walmart/product",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zWalmartProductQuery.extend({
                engine: zEngine("walmart_product"),
            }),
        },
    },
});
