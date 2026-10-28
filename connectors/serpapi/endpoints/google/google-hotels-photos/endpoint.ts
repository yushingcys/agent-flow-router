import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleHotelsPhotosQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_hotels_photos */
export default defineEndpoint({
    meta: {
        displayName: "List Hotel Photos",
        summary: "List the photos of one Google Hotels property.",
        description:
            "List the photos of one Google Hotels property. Runs SerpApi's `google_hotels_photos` engine. Requires `property_token`.",
        docsUrl: "https://serpapi.com/google-hotels-photos-api",
        categories: ["hotels"],
    },
    endpoint: "/google/hotels-photos",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleHotelsPhotosQuery.extend({
                engine: zEngine("google_hotels_photos"),
            }),
        },
    },
});
