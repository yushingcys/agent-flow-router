import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zAirbnbSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=airbnb */
export default defineEndpoint({
    meta: {
        displayName: "Search Vacation Rentals",
        summary: "Search Airbnb stays for a place and dates with prices.",
        description:
            "Search Airbnb stays for a place and dates with prices. Runs SerpApi's `airbnb` engine.",
        docsUrl: "https://serpapi.com/airbnb-search-api",
        categories: ["hotels"],
    },
    endpoint: "/airbnb/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zAirbnbSearchQuery.extend({
                engine: zEngine("airbnb"),
            }),
        },
    },
});
