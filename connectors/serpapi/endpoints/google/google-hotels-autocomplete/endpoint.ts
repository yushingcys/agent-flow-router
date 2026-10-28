import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleHotelsAutocompleteQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_hotels_autocomplete */
export default defineEndpoint({
    meta: {
        displayName: "Suggest Hotel Names",
        summary:
            "Get Google Hotels autocomplete suggestions for a partial name.",
        description:
            "Get Google Hotels autocomplete suggestions for a partial name. Runs SerpApi's `google_hotels_autocomplete` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/google-hotels-autocomplete-api",
        categories: ["hotels"],
    },
    endpoint: "/google/hotels-autocomplete",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleHotelsAutocompleteQuery.extend({
                engine: zEngine("google_hotels_autocomplete"),
            }),
        },
    },
});
