import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zYandexSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=yandex */
export default defineEndpoint({
    meta: {
        displayName: "Search Yandex Web",
        summary: "Run a Yandex web search and get parsed organic results.",
        description:
            "Run a Yandex web search and get parsed organic results. Runs SerpApi's `yandex` engine. Requires `text`.",
        docsUrl: "https://serpapi.com/yandex-search-api",
        categories: ["web-search"],
    },
    endpoint: "/yandex/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zYandexSearchQuery.extend({
                engine: zEngine("yandex"),
            }),
        },
    },
});
