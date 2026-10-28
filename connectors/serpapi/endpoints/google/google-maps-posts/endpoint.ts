import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleMapsPostsQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_maps_posts */
export default defineEndpoint({
    meta: {
        displayName: "List Business Updates",
        summary:
            "List a business's Google Maps posts (updates, offers, events).",
        description:
            "List a business's Google Maps posts (updates, offers, events). Runs SerpApi's `google_maps_posts` engine. Requires `data_id`.",
        docsUrl: "https://serpapi.com/google-maps-posts-api",
        categories: ["maps"],
    },
    endpoint: "/google/maps-posts",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleMapsPostsQuery.extend({
                engine: zEngine("google_maps_posts"),
            }),
        },
    },
});
