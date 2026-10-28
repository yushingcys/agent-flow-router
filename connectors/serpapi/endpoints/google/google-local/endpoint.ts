import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleLocalQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_local */
export default defineEndpoint({
    meta: {
        displayName: "Search Local Businesses",
        summary:
            "Search Google's local results for businesses near a location.",
        description:
            "Search Google's local results for businesses near a location. Runs SerpApi's `google_local` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/google-local-api",
        categories: ["maps"],
    },
    endpoint: "/google/local",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleLocalQuery.extend({
                engine: zEngine("google_local"),
            }),
        },
    },
});
