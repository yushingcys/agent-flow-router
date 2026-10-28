import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zYandexVideosQuery } from "./schema/inputs.ts";

/** GET /search?engine=yandex_videos */
export default defineEndpoint({
    meta: {
        displayName: "Search Yandex Videos",
        summary: "Search Yandex Videos and get video results with metadata.",
        description:
            "Search Yandex Videos and get video results with metadata. Runs SerpApi's `yandex_videos` engine. Requires `text`.",
        docsUrl: "https://serpapi.com/yandex-videos-api",
        categories: ["video-search"],
    },
    endpoint: "/yandex/videos",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zYandexVideosQuery.extend({
                engine: zEngine("yandex_videos"),
            }),
        },
    },
});
