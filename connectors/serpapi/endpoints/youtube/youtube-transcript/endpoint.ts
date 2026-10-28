import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zYoutubeTranscriptQuery } from "./schema/inputs.ts";

/** GET /search?engine=youtube_video_transcript */
export default defineEndpoint({
    meta: {
        displayName: "Get Video Transcript",
        summary: "Get the transcript or captions of a YouTube video.",
        description:
            "Get the transcript or captions of a YouTube video. Runs SerpApi's `youtube_video_transcript` engine. Requires `v`.",
        docsUrl: "https://serpapi.com/youtube-video-transcript",
        categories: ["youtube", "video-search"],
    },
    endpoint: "/youtube/transcript",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zYoutubeTranscriptQuery.extend({
                engine: zEngine("youtube_video_transcript"),
            }),
        },
    },
});
