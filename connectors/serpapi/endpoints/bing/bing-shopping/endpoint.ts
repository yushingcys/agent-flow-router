import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zBingShoppingQuery } from "./schema/inputs.ts";

/** GET /search?engine=bing_shopping */
export default defineEndpoint({
    meta: {
        displayName: "Compare Bing Offers",
        summary:
            "Search Bing Shopping and compare product prices across sellers.",
        description:
            "Search Bing Shopping and compare product prices across sellers. Runs SerpApi's `bing_shopping` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/bing-shopping-api",
        categories: ["web-search"],
    },
    endpoint: "/bing/shopping",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zBingShoppingQuery.extend({
                engine: zEngine("bing_shopping"),
            }),
        },
    },
});
