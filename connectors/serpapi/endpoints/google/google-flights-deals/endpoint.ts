import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleFlightsDealsQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_flights_deals */
export default defineEndpoint({
    meta: {
        displayName: "Find Cheap Fares",
        summary:
            "Find discounted flight deals from an origin across destinations.",
        description:
            "Find discounted flight deals from an origin across destinations. Runs SerpApi's `google_flights_deals` engine.",
        docsUrl: "https://serpapi.com/google-flights-deals-api",
        categories: ["flights"],
    },
    endpoint: "/google/flights-deals",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleFlightsDealsQuery.extend({
                engine: zEngine("google_flights_deals"),
            }),
        },
    },
});
