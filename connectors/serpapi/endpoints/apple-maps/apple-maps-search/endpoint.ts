import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zAppleMapsSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=apple_maps */
export default defineEndpoint({
    meta: {
        displayName: "Search Apple Places",
        summary: "Search Apple Maps for businesses and places near a location.",
        description:
            "Search Apple Maps for businesses and places near a location. Runs SerpApi's `apple_maps` engine. Requires `query`.",
        docsUrl: "https://serpapi.com/apple-maps-api",
        categories: ["maps"],
    },
    endpoint: "/apple-maps/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zAppleMapsSearchQuery.extend({
                engine: zEngine("apple_maps"),
            }),
        },
    },
});
