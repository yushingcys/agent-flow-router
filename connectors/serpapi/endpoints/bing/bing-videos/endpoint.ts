import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zBingVideosQuery } from "./schema/inputs.ts";

/** GET /search?engine=bing_videos */
export default defineEndpoint({
    meta: {
        displayName: "Search Bing Videos",
        summary: "Search Bing Videos and get video results with metadata.",
        description:
            "Search Bing Videos and get video results with metadata. Runs SerpApi's `bing_videos` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/bing-videos-api",
        categories: ["video-search"],
    },
    endpoint: "/bing/videos",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zBingVideosQuery.extend({
                engine: zEngine("bing_videos"),
            }),
        },
    },
});
