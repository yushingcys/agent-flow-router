import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleMapsQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_maps */
export default defineEndpoint({
    meta: {
        displayName: "Search Map Places",
        summary:
            "Search Google Maps for places or fetch one place's full details.",
        description:
            "Search Google Maps for places or fetch one place's full details. Runs SerpApi's `google_maps` engine.",
        docsUrl: "https://serpapi.com/google-maps-api",
        categories: ["maps"],
    },
    endpoint: "/google/maps",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleMapsQuery.extend({
                engine: zEngine("google_maps"),
            }),
        },
    },
});
