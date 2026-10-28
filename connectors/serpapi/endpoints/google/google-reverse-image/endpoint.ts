import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleReverseImageQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_reverse_image */
export default defineEndpoint({
    meta: {
        displayName: "Reverse Image Lookup",
        summary: "Find web pages that contain an image, given the image URL.",
        description:
            "Find web pages that contain an image, given the image URL. Runs SerpApi's `google_reverse_image` engine. Requires `image_url`.",
        docsUrl: "https://serpapi.com/google-reverse-image",
        categories: ["image-search"],
    },
    endpoint: "/google/reverse-image",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleReverseImageQuery.extend({
                engine: zEngine("google_reverse_image"),
            }),
        },
    },
});
