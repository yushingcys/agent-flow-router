import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zYoutubeChannelQuery } from "./schema/inputs.ts";

/** GET /search?engine=youtube_channel */
export default defineEndpoint({
    meta: {
        displayName: "Get YouTube Channel",
        summary: "Get a YouTube channel's profile and its videos.",
        description:
            "Get a YouTube channel's profile and its videos. Runs SerpApi's `youtube_channel` engine.",
        docsUrl: "https://serpapi.com/youtube-channel-api",
        categories: ["youtube", "video-search"],
    },
    endpoint: "/youtube/channel",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zYoutubeChannelQuery.extend({
                engine: zEngine("youtube_channel"),
            }),
        },
    },
});
