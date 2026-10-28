import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleImagesLightQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_images_light */
export default defineEndpoint({
    meta: {
        displayName: "Fast Image Search",
        summary: "Get fast, lightweight Google Images results for a query.",
        description:
            "Get fast, lightweight Google Images results for a query. Runs SerpApi's `google_images_light` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/google-images-light-api",
        categories: ["image-search"],
    },
    endpoint: "/google/images-light",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleImagesLightQuery.extend({
                engine: zEngine("google_images_light"),
            }),
        },
    },
});
