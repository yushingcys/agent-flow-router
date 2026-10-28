import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zAmazonSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=amazon */
export default defineEndpoint({
    meta: {
        displayName: "Search Amazon Products",
        summary:
            "Search Amazon and get product listings with prices and ratings.",
        description:
            "Search Amazon and get product listings with prices and ratings. Runs SerpApi's `amazon` engine.",
        docsUrl: "https://serpapi.com/amazon-search-api",
        categories: ["amazon"],
    },
    endpoint: "/amazon/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zAmazonSearchQuery.extend({
                engine: zEngine("amazon"),
            }),
        },
    },
});
