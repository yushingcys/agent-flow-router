import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zYoutubeVideoQuery } from "./schema/inputs.ts";

/** GET /search?engine=youtube_video */
export default defineEndpoint({
    meta: {
        displayName: "Get YouTube Video",
        summary:
            "Get one YouTube video's details, chapters, and related videos.",
        description:
            "Get one YouTube video's details, chapters, and related videos. Runs SerpApi's `youtube_video` engine.",
        docsUrl: "https://serpapi.com/youtube-video-api",
        categories: ["youtube", "video-search"],
    },
    endpoint: "/youtube/video",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zYoutubeVideoQuery.extend({
                engine: zEngine("youtube_video"),
            }),
        },
    },
});
