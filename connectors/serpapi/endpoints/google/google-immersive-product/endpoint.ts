import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleImmersiveProductQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_immersive_product */
export default defineEndpoint({
    meta: {
        displayName: "Expand Product Popup",
        summary:
            "Expand a Google product popup (page_token) into stores, prices, and reviews.",
        description:
            "Expand a Google product popup (page_token) into stores, prices, and reviews. Runs SerpApi's `google_immersive_product` engine. Requires `page_token`.",
        docsUrl: "https://serpapi.com/google-immersive-product-api",
        categories: ["google-shopping"],
    },
    endpoint: "/google/immersive-product",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleImmersiveProductQuery.extend({
                engine: zEngine("google_immersive_product"),
            }),
        },
    },
});
