import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleImagesRelatedQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_images_related_content */
export default defineEndpoint({
    meta: {
        displayName: "Get Related Images",
        summary: "Get images and searches related to one Google Images result.",
        description:
            "Get images and searches related to one Google Images result. Runs SerpApi's `google_images_related_content` engine. Requires `related_content_id`.",
        docsUrl: "https://serpapi.com/google-images-related-content-api",
        categories: ["image-search"],
    },
    endpoint: "/google/images-related",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleImagesRelatedQuery.extend({
                engine: zEngine("google_images_related_content"),
            }),
        },
    },
});
