import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleImagesQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_images */
export default defineEndpoint({
    meta: {
        displayName: "Search Images",
        summary:
            "Search Google Images and get image results with source pages.",
        description:
            "Search Google Images and get image results with source pages. Runs SerpApi's `google_images` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/google-images-api",
        categories: ["image-search"],
    },
    endpoint: "/google/images",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleImagesQuery.extend({
                engine: zEngine("google_images"),
            }),
        },
    },
});
