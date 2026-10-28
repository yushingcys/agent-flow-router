import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zAmazonProductQuery } from "./schema/inputs.ts";

/** GET /search?engine=amazon_product */
export default defineEndpoint({
    meta: {
        displayName: "Get Amazon Listing",
        summary: "Get one Amazon product page by ASIN with offers and details.",
        description:
            "Get one Amazon product page by ASIN with offers and details. Runs SerpApi's `amazon_product` engine. Requires `asin`.",
        docsUrl: "https://serpapi.com/amazon-product-api",
        categories: ["amazon"],
    },
    endpoint: "/amazon/product",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zAmazonProductQuery.extend({
                engine: zEngine("amazon_product"),
            }),
        },
    },
});
