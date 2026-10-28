import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleMapsDirectionsQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_maps_directions */
export default defineEndpoint({
    meta: {
        displayName: "Get Route Directions",
        summary:
            "Get Google Maps directions, distances, and durations between places.",
        description:
            "Get Google Maps directions, distances, and durations between places. Runs SerpApi's `google_maps_directions` engine.",
        docsUrl: "https://serpapi.com/google-maps-directions-api",
        categories: ["maps"],
    },
    endpoint: "/google/maps-directions",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleMapsDirectionsQuery.extend({
                engine: zEngine("google_maps_directions"),
            }),
        },
    },
});
