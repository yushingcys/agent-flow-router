import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zZillowSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=zillow */
export default defineEndpoint({
    meta: {
        displayName: "Search Home Listings",
        summary:
            "Search Zillow homes for sale or rent with prices and details.",
        description:
            "Search Zillow homes for sale or rent with prices and details. Runs SerpApi's `zillow` engine.",
        docsUrl: "https://serpapi.com/zillow-search-api",
        categories: ["web-search"],
    },
    endpoint: "/zillow/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zZillowSearchQuery.extend({
                engine: zEngine("zillow"),
            }),
        },
    },
});
