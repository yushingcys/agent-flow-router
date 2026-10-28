import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleAiModeQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_ai_mode */
export default defineEndpoint({
    meta: {
        displayName: "Ask AI Mode",
        summary:
            "Ask Google AI Mode a question and get its generated answer with sources.",
        description:
            "Ask Google AI Mode a question and get its generated answer with sources. Runs SerpApi's `google_ai_mode` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/google-ai-mode-api",
        categories: ["ai-search"],
    },
    endpoint: "/google/ai-mode",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleAiModeQuery.extend({
                engine: zEngine("google_ai_mode"),
            }),
        },
    },
});
