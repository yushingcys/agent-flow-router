import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleTravelExploreQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_travel_explore */
export default defineEndpoint({
    meta: {
        displayName: "Explore Trip Destinations",
        summary:
            "Explore destinations and prices reachable from an origin airport.",
        description:
            "Explore destinations and prices reachable from an origin airport. Runs SerpApi's `google_travel_explore` engine. Requires `departure_id`.",
        docsUrl: "https://serpapi.com/google-travel-explore-api",
        categories: ["flights"],
    },
    endpoint: "/google/travel-explore",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleTravelExploreQuery.extend({
                engine: zEngine("google_travel_explore"),
            }),
        },
    },
});
