import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zAmazonAutocompleteQuery } from "./schema/inputs.ts";

/** GET /search?engine=amazon_autocomplete */
export default defineEndpoint({
    meta: {
        displayName: "Suggest Amazon Keywords",
        summary: "Get Amazon search-box suggestions for a partial keyword.",
        description:
            "Get Amazon search-box suggestions for a partial keyword. Runs SerpApi's `amazon_autocomplete` engine. Requires `k`.",
        docsUrl: "https://serpapi.com/amazon-autocomplete-api",
        categories: ["amazon"],
    },
    endpoint: "/amazon/autocomplete",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zAmazonAutocompleteQuery.extend({
                engine: zEngine("amazon_autocomplete"),
            }),
        },
    },
});
