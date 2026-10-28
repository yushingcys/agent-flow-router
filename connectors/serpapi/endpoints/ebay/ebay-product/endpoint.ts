import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zEbayProductQuery } from "./schema/inputs.ts";

/** GET /search?engine=ebay_product */
export default defineEndpoint({
    meta: {
        displayName: "Get eBay Listing",
        summary:
            "Get one eBay listing with specs, seller, and shipping details.",
        description:
            "Get one eBay listing with specs, seller, and shipping details. Runs SerpApi's `ebay_product` engine. Requires `product_id`.",
        docsUrl: "https://serpapi.com/ebay-product-api",
        categories: ["web-search"],
    },
    endpoint: "/ebay/product",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zEbayProductQuery.extend({
                engine: zEngine("ebay_product"),
            }),
        },
    },
});
