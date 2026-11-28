import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zExpediaHotelsQuery } from "./schema/inputs.ts";

/** GET /search?engine=expedia_hotels */
export default defineEndpoint({
    meta: {
        displayName: "Search Expedia Hotels",
        summary:
            "Search Expedia hotels and vacation rentals with nightly prices.",
        description:
            "Search Expedia for hotels and vacation rentals, with nightly prices, ratings, and photos. Unofficial results via SerpApi's `expedia_hotels` engine, not an official Expedia API. Pass q or region_id. region_id overrides q.",
        docsUrl: "https://serpapi.com/expedia-hotels-api",
        categories: ["hotels"],
        notes: [
            "Pass q or region_id. region_id overrides q. check_in_date and check_out_date must be sent together.",
            'rating is a string such as "8", not an integer.',
        ],
    },
    endpoint: "/expedia/hotels",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zExpediaHotelsQuery.extend({
                engine: zEngine("expedia_hotels"),
            }),
        },
    },
});
