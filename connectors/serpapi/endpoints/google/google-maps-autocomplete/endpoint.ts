import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleMapsAutocompleteQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_maps_autocomplete */
export default defineEndpoint({
    meta: {
        displayName: "Suggest Map Places",
        summary: "Get Google Maps autocomplete suggestions near a coordinate.",
        description:
            "Get Google Maps autocomplete suggestions near a coordinate. Runs SerpApi's `google_maps_autocomplete` engine. Requires `q`, `ll`.",
        docsUrl: "https://serpapi.com/google-maps-autocomplete-api",
        categories: ["maps"],
    },
    endpoint: "/google/maps-autocomplete",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleMapsAutocompleteQuery.extend({
                engine: zEngine("google_maps_autocomplete"),
            }),
        },
    },
});
