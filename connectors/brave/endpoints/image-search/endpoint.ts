import { defineEndpoint } from "@shared/core";
import { zBraveImageSearchQuery } from "./schema/inputs.ts";

/** GET /res/v1/images/search — image results. */
export default defineEndpoint({
    meta: {
        displayName: "Brave Image Search",
        summary: "Search images from Brave's index.",
        description: "Search images and get up to 200 results per call, " +
            "each with the image URL and dimensions, a thumbnail, the " +
            "page it was found on, its source domain, and a confidence " +
            "level.",
        docsUrl:
            "https://api-dashboard.search.brave.com/api-reference/images/image_search",
        categories: ["image-search"],
        notes: [
            "Not paginated: one call returns up to `count` (max 200) " +
            "images. `safesearch` defaults to strict.",
        ],
    },
    request: { method: "GET", path: "/res/v1/images/search" },
    input: { schema: { queryParams: zBraveImageSearchQuery } },
});
