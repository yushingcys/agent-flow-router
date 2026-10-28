import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleAiOverviewQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_ai_overview */
export default defineEndpoint({
    meta: {
        displayName: "Fetch AI Overview",
        summary:
            "Fetch the full Google AI Overview behind a page_token from a search result.",
        description:
            "Fetch the full Google AI Overview behind a page_token from a search result. Runs SerpApi's `google_ai_overview` engine. Requires `page_token`.",
        docsUrl: "https://serpapi.com/google-ai-overview-api",
        categories: ["ai-search"],
    },
    endpoint: "/google/ai-overview",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleAiOverviewQuery.extend({
                engine: zEngine("google_ai_overview"),
            }),
        },
    },
});
