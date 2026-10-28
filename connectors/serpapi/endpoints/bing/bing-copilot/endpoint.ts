import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zBingCopilotQuery } from "./schema/inputs.ts";

/** GET /search?engine=bing_copilot */
export default defineEndpoint({
    meta: {
        displayName: "Ask Copilot",
        summary: "Ask Microsoft Copilot a question and get its cited answer.",
        description:
            "Ask Microsoft Copilot a question and get its cited answer. Runs SerpApi's `bing_copilot` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/bing-copilot-api",
        categories: ["ai-search"],
    },
    endpoint: "/bing/copilot",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zBingCopilotQuery.extend({
                engine: zEngine("bing_copilot"),
            }),
        },
    },
});
