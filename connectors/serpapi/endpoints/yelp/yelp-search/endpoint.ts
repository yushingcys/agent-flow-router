import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zYelpSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=yelp */
export default defineEndpoint({
    meta: {
        displayName: "Search Yelp Businesses",
        summary: "Search Yelp for businesses in a location with ratings.",
        description:
            "Search Yelp for businesses in a location with ratings. Runs SerpApi's `yelp` engine. Requires `find_loc`.",
        docsUrl: "https://serpapi.com/yelp-search-api",
        categories: ["maps"],
    },
    endpoint: "/yelp/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zYelpSearchQuery.extend({ engine: zEngine("yelp") }),
        },
    },
});
