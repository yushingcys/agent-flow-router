import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zYahooImagesQuery } from "./schema/inputs.ts";

/** GET /search?engine=yahoo_images */
export default defineEndpoint({
    meta: {
        displayName: "Search Yahoo Images",
        summary: "Search Yahoo Images and get image results with sources.",
        description:
            "Search Yahoo Images and get image results with sources. Runs SerpApi's `yahoo_images` engine. Requires `p`.",
        docsUrl: "https://serpapi.com/yahoo-images-api",
        categories: ["image-search"],
    },
    endpoint: "/yahoo/images",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zYahooImagesQuery.extend({
                engine: zEngine("yahoo_images"),
            }),
        },
    },
});
