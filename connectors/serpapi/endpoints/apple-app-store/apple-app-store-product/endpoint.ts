import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zAppleAppStoreProductQuery } from "./schema/inputs.ts";

/** GET /search?engine=apple_product */
export default defineEndpoint({
    meta: {
        displayName: "Get iOS App Details",
        summary: "Get one App Store app page with ratings, privacy, and IAPs.",
        description:
            "Get one App Store app page with ratings, privacy, and IAPs. Runs SerpApi's `apple_product` engine. Requires `product_id`.",
        docsUrl: "https://serpapi.com/apple-product",
        categories: ["app-stores"],
    },
    endpoint: "/apple-app-store/product",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zAppleAppStoreProductQuery.extend({
                engine: zEngine("apple_product"),
            }),
        },
    },
});
