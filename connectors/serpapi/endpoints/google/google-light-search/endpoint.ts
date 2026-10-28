import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleLightSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_light */
export default defineEndpoint({
    meta: {
        displayName: "Fast Web Search",
        summary: "Get fast, lightweight Google organic results for a query.",
        description:
            "Get fast, lightweight Google organic results for a query. Runs SerpApi's `google_light` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/google-light-api",
        categories: ["web-search"],
    },
    endpoint: "/google/light-search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleLightSearchQuery.extend({
                engine: zEngine("google_light"),
            }),
        },
    },
});
