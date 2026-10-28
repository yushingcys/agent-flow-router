import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleMapsPhotosQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_maps_photos */
export default defineEndpoint({
    meta: {
        displayName: "List Place Photos",
        summary: "List the photos posted on one Google Maps place.",
        description:
            "List the photos posted on one Google Maps place. Runs SerpApi's `google_maps_photos` engine. Requires `data_id`.",
        docsUrl: "https://serpapi.com/google-maps-photos-api",
        categories: ["maps"],
    },
    endpoint: "/google/maps-photos",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleMapsPhotosQuery.extend({
                engine: zEngine("google_maps_photos"),
            }),
        },
    },
});
