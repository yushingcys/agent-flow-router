import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleFlightsAutocompleteQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_flights_autocomplete */
export default defineEndpoint({
    meta: {
        displayName: "Resolve Airport Codes",
        summary:
            "Turn a city or airport name into airport codes and location ids.",
        description:
            "Turn a city or airport name into airport codes and location ids. Runs SerpApi's `google_flights_autocomplete` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/google-flights-autocomplete-api",
        categories: ["flights"],
    },
    endpoint: "/google/flights-autocomplete",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleFlightsAutocompleteQuery.extend({
                engine: zEngine("google_flights_autocomplete"),
            }),
        },
    },
});
