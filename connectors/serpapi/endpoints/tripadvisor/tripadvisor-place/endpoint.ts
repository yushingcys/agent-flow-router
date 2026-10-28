import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zTripadvisorPlaceQuery } from "./schema/inputs.ts";

/** GET /search?engine=tripadvisor_place */
export default defineEndpoint({
    meta: {
        displayName: "Get Travel Listing",
        summary:
            "Get one Tripadvisor place with ratings, amenities, and rankings.",
        description:
            "Get one Tripadvisor place with ratings, amenities, and rankings. Runs SerpApi's `tripadvisor_place` engine. Requires `place_id`.",
        docsUrl: "https://serpapi.com/tripadvisor-place-api",
        categories: ["maps"],
    },
    endpoint: "/tripadvisor/place",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zTripadvisorPlaceQuery.extend({
                engine: zEngine("tripadvisor_place"),
            }),
        },
    },
});
