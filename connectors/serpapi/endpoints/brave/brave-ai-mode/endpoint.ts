import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zBraveAiModeQuery } from "./schema/inputs.ts";

/** GET /search?engine=brave_ai_mode */
export default defineEndpoint({
    meta: {
        displayName: "Ask Brave Assistant",
        summary:
            "Ask Brave's AI answer engine a question and get a cited answer.",
        description:
            "Ask Brave's AI answer engine a question and get a cited answer. Runs SerpApi's `brave_ai_mode` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/brave-ai-mode-api",
        categories: ["ai-search"],
    },
    endpoint: "/brave/ai-mode",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zBraveAiModeQuery.extend({
                engine: zEngine("brave_ai_mode"),
            }),
        },
    },
});
