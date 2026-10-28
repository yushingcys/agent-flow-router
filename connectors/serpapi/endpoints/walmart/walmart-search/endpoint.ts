import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zWalmartSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=walmart */
export default defineEndpoint({
    meta: {
        displayName: "Search Walmart Products",
        summary:
            "Search Walmart and get product listings with prices and ratings.",
        description:
            "Search Walmart and get product listings with prices and ratings. Runs SerpApi's `walmart` engine.",
        docsUrl: "https://serpapi.com/walmart-search-api",
        categories: ["walmart"],
    },
    endpoint: "/walmart/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zWalmartSearchQuery.extend({
                engine: zEngine("walmart"),
            }),
        },
    },
});
