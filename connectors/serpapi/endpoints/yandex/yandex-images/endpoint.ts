import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zYandexImagesQuery } from "./schema/inputs.ts";

/** GET /search?engine=yandex_images */
export default defineEndpoint({
    meta: {
        displayName: "Search Yandex Images",
        summary: "Search Yandex Images or find images similar to an image URL.",
        description:
            "Search Yandex Images or find images similar to an image URL. Runs SerpApi's `yandex_images` engine. Requires `text`.",
        docsUrl: "https://serpapi.com/yandex-images-api",
        categories: ["image-search"],
    },
    endpoint: "/yandex/images",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zYandexImagesQuery.extend({
                engine: zEngine("yandex_images"),
            }),
        },
    },
});
