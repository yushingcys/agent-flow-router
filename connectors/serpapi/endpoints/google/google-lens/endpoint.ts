import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleLensQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_lens */
export default defineEndpoint({
    meta: {
        displayName: "Identify Image Contents",
        summary:
            "Run Google Lens on an image URL to find visual and exact matches.",
        description:
            "Run Google Lens on an image URL to find visual and exact matches. Runs SerpApi's `google_lens` engine. Requires `url`, `type`.",
        docsUrl: "https://serpapi.com/google-lens-api",
        categories: ["image-search"],
    },
    endpoint: "/google/lens",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleLensQuery.extend({
                engine: zEngine("google_lens"),
            }),
        },
    },
});
