import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zEbaySearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=ebay */
export default defineEndpoint({
    meta: {
        displayName: "Search eBay Listings",
        summary: "Search eBay listings with prices, condition, and shipping.",
        description:
            "Search eBay listings with prices, condition, and shipping. Runs SerpApi's `ebay` engine. Requires `_nkw`.",
        docsUrl: "https://serpapi.com/ebay-search-api",
        categories: ["web-search"],
    },
    endpoint: "/ebay/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zEbaySearchQuery.extend({ engine: zEngine("ebay") }),
        },
    },
});
