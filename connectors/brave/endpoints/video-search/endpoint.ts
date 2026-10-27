import { defineEndpoint } from "@shared/core";
import { zBraveVideoSearchQuery } from "./schema/inputs.ts";

/** GET /res/v1/videos/search — video results. */
export default defineEndpoint({
    meta: {
        displayName: "Brave Video Search",
        summary: "Search videos from Brave's index.",
        description: "Search videos and get results with title, URL, " +
            "description, age, thumbnail, and video metadata (duration, " +
            "views, creator, publisher). Page with `count` (1-50) and " +
            "`offset` (0-9); filter by freshness.",
        docsUrl:
            "https://api-dashboard.search.brave.com/api-reference/videos/video_search/get",
        categories: ["video-search"],
    },
    request: { method: "GET", path: "/res/v1/videos/search" },
    input: { schema: { queryParams: zBraveVideoSearchQuery } },
});
