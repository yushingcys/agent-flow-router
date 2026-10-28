import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zBingImagesQuery } from "./schema/inputs.ts";

/** GET /search?engine=bing_images */
export default defineEndpoint({
    meta: {
        displayName: "Search Bing Images",
        summary: "Search Bing Images and get image results with sources.",
        description:
            "Search Bing Images and get image results with sources. Runs SerpApi's `bing_images` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/bing-images-api",
        categories: ["image-search"],
    },
    endpoint: "/bing/images",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zBingImagesQuery.extend({
                engine: zEngine("bing_images"),
            }),
        },
    },
});
