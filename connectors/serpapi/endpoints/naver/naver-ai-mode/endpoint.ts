import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zNaverAiModeQuery } from "./schema/inputs.ts";

/** GET /search?engine=naver_ai_mode */
export default defineEndpoint({
    meta: {
        displayName: "Ask Naver AI",
        summary: "Ask Naver's AI tab a question and get its cited answer.",
        description:
            "Ask Naver's AI tab a question and get its cited answer. Runs SerpApi's `naver_ai_mode` engine. Requires `query`.",
        docsUrl: "https://serpapi.com/naver-ai-mode-api",
        categories: ["ai-search"],
    },
    endpoint: "/naver/ai-mode",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zNaverAiModeQuery.extend({
                engine: zEngine("naver_ai_mode"),
            }),
        },
    },
});
