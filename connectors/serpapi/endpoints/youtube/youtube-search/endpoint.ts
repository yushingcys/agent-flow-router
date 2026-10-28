import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zYoutubeSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=youtube */
export default defineEndpoint({
    meta: {
        displayName: "Search YouTube",
        summary: "Search YouTube for videos, shorts, channels, and playlists.",
        description:
            "Search YouTube for videos, shorts, channels, and playlists. Runs SerpApi's `youtube` engine. Requires `search_query`.",
        docsUrl: "https://serpapi.com/youtube-search-api",
        categories: ["youtube", "video-search"],
    },
    endpoint: "/youtube/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zYoutubeSearchQuery.extend({
                engine: zEngine("youtube"),
            }),
        },
    },
});
