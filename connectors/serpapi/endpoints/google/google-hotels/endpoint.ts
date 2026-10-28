import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleHotelsQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_hotels */
export default defineEndpoint({
    meta: {
        displayName: "Search Hotel Rates",
        summary:
            "Search hotels and vacation rentals with nightly rates for given dates.",
        description:
            "Search hotels and vacation rentals with nightly rates for given dates. Runs SerpApi's `google_hotels` engine. Requires `check_in_date`, `check_out_date`.",
        docsUrl: "https://serpapi.com/google-hotels-api",
        categories: ["hotels"],
    },
    endpoint: "/google/hotels",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleHotelsQuery.extend({
                engine: zEngine("google_hotels"),
            }),
        },
    },
});
