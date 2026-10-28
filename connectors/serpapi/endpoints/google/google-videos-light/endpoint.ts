import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleVideosLightQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_videos_light */
export default defineEndpoint({
    meta: {
        displayName: "Fast Video Search",
        summary: "Get fast, lightweight Google Videos results for a query.",
        description:
            "Get fast, lightweight Google Videos results for a query. Runs SerpApi's `google_videos_light` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/google-videos-light-api",
        categories: ["video-search"],
    },
    endpoint: "/google/videos-light",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleVideosLightQuery.extend({
                engine: zEngine("google_videos_light"),
            }),
        },
    },
});
