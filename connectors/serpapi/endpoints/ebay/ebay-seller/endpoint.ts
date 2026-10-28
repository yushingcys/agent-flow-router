import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zEbaySellerQuery } from "./schema/inputs.ts";

/** GET /search?engine=ebay_seller */
export default defineEndpoint({
    meta: {
        displayName: "Profile eBay Seller",
        summary: "Get an eBay seller's profile, feedback, and listings.",
        description:
            "Get an eBay seller's profile, feedback, and listings. Runs SerpApi's `ebay_seller` engine. Requires `seller_id`, `type`.",
        docsUrl: "https://serpapi.com/ebay-seller-api",
        categories: ["web-search"],
    },
    endpoint: "/ebay/seller",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zEbaySellerQuery.extend({
                engine: zEngine("ebay_seller"),
            }),
        },
    },
});
