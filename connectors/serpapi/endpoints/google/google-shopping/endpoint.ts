import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleShoppingQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_shopping */
export default defineEndpoint({
    meta: {
        displayName: "Compare Product Prices",
        summary:
            "Search Google Shopping and compare product offers across stores.",
        description:
            "Search Google Shopping and compare product offers across stores. Runs SerpApi's `google_shopping` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/google-shopping-api",
        categories: ["google-shopping"],
    },
    endpoint: "/google/shopping",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleShoppingQuery.extend({
                engine: zEngine("google_shopping"),
            }),
        },
    },
});
