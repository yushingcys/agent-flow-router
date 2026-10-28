import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleVideosQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_videos */
export default defineEndpoint({
    meta: {
        displayName: "Search Videos",
        summary: "Search Google Videos and get video results across platforms.",
        description:
            "Search Google Videos and get video results across platforms. Runs SerpApi's `google_videos` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/google-videos-api",
        categories: ["video-search"],
    },
    endpoint: "/google/videos",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleVideosQuery.extend({
                engine: zEngine("google_videos"),
            }),
        },
    },
});
