import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleFlightsQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_flights */
export default defineEndpoint({
    meta: {
        displayName: "Search Airfares",
        summary:
            "Search flight itineraries and fares between airports for given dates.",
        description:
            "Search flight itineraries and fares between airports for given dates. Runs SerpApi's `google_flights` engine.",
        docsUrl: "https://serpapi.com/google-flights-api",
        categories: ["flights"],
    },
    endpoint: "/google/flights",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleFlightsQuery.extend({
                engine: zEngine("google_flights"),
            }),
        },
    },
});
