import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zDuckduckgoAiChatQuery } from "./schema/inputs.ts";

/** GET /search?engine=duck_ai */
export default defineEndpoint({
    meta: {
        displayName: "Ask Duck AI",
        summary: "Ask DuckDuckGo's AI chat a question and get a cited answer.",
        description:
            "Ask DuckDuckGo's AI chat a question and get a cited answer. Runs SerpApi's `duck_ai` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/duck-ai-api",
        categories: ["ai-search"],
    },
    endpoint: "/duckduckgo/ai-chat",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zDuckduckgoAiChatQuery.extend({
                engine: zEngine("duck_ai"),
            }),
        },
    },
});
