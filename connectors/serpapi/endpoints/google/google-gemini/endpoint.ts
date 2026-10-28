import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleGeminiQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_gemini */
export default defineEndpoint({
    meta: {
        displayName: "Ask Gemini",
        summary:
            "Ask Google Gemini a prompt and get its answer as structured blocks.",
        description:
            "Ask Google Gemini a prompt and get its answer as structured blocks. Runs SerpApi's `google_gemini` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/google-gemini-api",
        categories: ["ai-search"],
    },
    endpoint: "/google/gemini",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleGeminiQuery.extend({
                engine: zEngine("google_gemini"),
            }),
        },
    },
});
