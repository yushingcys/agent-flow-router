import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleShoppingLightQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_shopping_light */
export default defineEndpoint({
    meta: {
        displayName: "Fast Shopping Search",
        summary: "Get fast, lightweight Google Shopping results for a query.",
        description:
            "Get fast, lightweight Google Shopping results for a query. Runs SerpApi's `google_shopping_light` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/google-shopping-light-api",
        categories: ["google-shopping"],
    },
    endpoint: "/google/shopping-light",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleShoppingLightQuery.extend({
                engine: zEngine("google_shopping_light"),
            }),
        },
    },
});
