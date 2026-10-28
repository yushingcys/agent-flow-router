import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zNaverAiOverviewQuery } from "./schema/inputs.ts";

/** GET /search?engine=naver_ai_overview */
export default defineEndpoint({
    meta: {
        displayName: "Fetch Naver Briefing",
        summary: "Fetch Naver's AI overview briefing for a query.",
        description:
            "Fetch Naver's AI overview briefing for a query. Runs SerpApi's `naver_ai_overview` engine.",
        docsUrl: "https://serpapi.com/naver-ai-overview-api",
        categories: ["ai-search"],
    },
    endpoint: "/naver/ai-overview",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zNaverAiOverviewQuery.extend({
                engine: zEngine("naver_ai_overview"),
            }),
        },
    },
});
