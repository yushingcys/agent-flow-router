import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleShortVideosQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_short_videos */
export default defineEndpoint({
    meta: {
        displayName: "Search Short Videos",
        summary:
            "Search short-form videos (Shorts, TikTok, Reels) indexed by Google.",
        description:
            "Search short-form videos (Shorts, TikTok, Reels) indexed by Google. Runs SerpApi's `google_short_videos` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/google-short-videos-api",
        categories: ["video-search"],
    },
    endpoint: "/google/short-videos",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleShortVideosQuery.extend({
                engine: zEngine("google_short_videos"),
            }),
        },
    },
});
