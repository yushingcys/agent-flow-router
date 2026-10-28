import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zYahooVideosQuery } from "./schema/inputs.ts";

/** GET /search?engine=yahoo_videos */
export default defineEndpoint({
    meta: {
        displayName: "Search Yahoo Videos",
        summary: "Search Yahoo Videos and get video results with metadata.",
        description:
            "Search Yahoo Videos and get video results with metadata. Runs SerpApi's `yahoo_videos` engine. Requires `p`.",
        docsUrl: "https://serpapi.com/yahoo-videos-api",
        categories: ["video-search"],
    },
    endpoint: "/yahoo/videos",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zYahooVideosQuery.extend({
                engine: zEngine("yahoo_videos"),
            }),
        },
    },
});
