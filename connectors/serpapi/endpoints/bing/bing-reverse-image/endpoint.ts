import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zBingReverseImageQuery } from "./schema/inputs.ts";

/** GET /search?engine=bing_reverse_image */
export default defineEndpoint({
    meta: {
        displayName: "Match Image on Bing",
        summary: "Find pages and similar images for an image URL using Bing.",
        description:
            "Find pages and similar images for an image URL using Bing. Runs SerpApi's `bing_reverse_image` engine. Requires `image_url`.",
        docsUrl: "https://serpapi.com/bing-reverse-image-api",
        categories: ["image-search"],
    },
    endpoint: "/bing/reverse-image",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zBingReverseImageQuery.extend({
                engine: zEngine("bing_reverse_image"),
            }),
        },
    },
});
