import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zBingMapsQuery } from "./schema/inputs.ts";

/** GET /search?engine=bing_maps */
export default defineEndpoint({
    meta: {
        displayName: "Search Bing Places",
        summary: "Search Bing Maps for local businesses and places.",
        description:
            "Search Bing Maps for local businesses and places. Runs SerpApi's `bing_maps` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/bing-maps-api",
        categories: ["maps"],
    },
    endpoint: "/bing/maps",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zBingMapsQuery.extend({
                engine: zEngine("bing_maps"),
            }),
        },
    },
});
