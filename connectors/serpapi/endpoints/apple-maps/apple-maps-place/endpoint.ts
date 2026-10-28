import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zAppleMapsPlaceQuery } from "./schema/inputs.ts";

/** GET /search?engine=apple_maps_places */
export default defineEndpoint({
    meta: {
        displayName: "Get Apple Place",
        summary: "Get one Apple Maps place by muid with full business details.",
        description:
            "Get one Apple Maps place by muid with full business details. Runs SerpApi's `apple_maps_places` engine. Requires `muid`.",
        docsUrl: "https://serpapi.com/apple-maps-places-api",
        categories: ["maps"],
    },
    endpoint: "/apple-maps/place",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zAppleMapsPlaceQuery.extend({
                engine: zEngine("apple_maps_places"),
            }),
        },
    },
});
