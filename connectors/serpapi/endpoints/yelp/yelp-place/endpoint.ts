import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zYelpPlaceQuery } from "./schema/inputs.ts";

/** GET /search?engine=yelp_place */
export default defineEndpoint({
    meta: {
        displayName: "Get Yelp Business",
        summary:
            "Get one Yelp business page with hours, amenities, and ratings.",
        description:
            "Get one Yelp business page with hours, amenities, and ratings. Runs SerpApi's `yelp_place` engine. Requires `place_id`.",
        docsUrl: "https://serpapi.com/yelp-place",
        categories: ["maps"],
    },
    endpoint: "/yelp/place",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zYelpPlaceQuery.extend({
                engine: zEngine("yelp_place"),
            }),
        },
    },
});
