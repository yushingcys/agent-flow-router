import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleAutocompleteQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_autocomplete */
export default defineEndpoint({
    meta: {
        displayName: "Suggest Search Queries",
        summary: "Get Google's autocomplete suggestions for a partial query.",
        description:
            "Get Google's autocomplete suggestions for a partial query. Runs SerpApi's `google_autocomplete` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/google-autocomplete-api",
        categories: ["seo"],
    },
    endpoint: "/google/autocomplete",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleAutocompleteQuery.extend({
                engine: zEngine("google_autocomplete"),
            }),
        },
    },
});
