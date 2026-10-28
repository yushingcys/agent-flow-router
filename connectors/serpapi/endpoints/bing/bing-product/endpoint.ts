import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zBingProductQuery } from "./schema/inputs.ts";

/** GET /search?engine=bing_product */
export default defineEndpoint({
    meta: {
        displayName: "Get Bing Product",
        summary:
            "Get one Bing Shopping product with sellers, reviews, and variants.",
        description:
            "Get one Bing Shopping product with sellers, reviews, and variants. Runs SerpApi's `bing_product` engine. Requires `product_token`.",
        docsUrl: "https://serpapi.com/bing-product-api",
        categories: ["web-search"],
    },
    endpoint: "/bing/product",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zBingProductQuery.extend({
                engine: zEngine("bing_product"),
            }),
        },
    },
});
