import { defineEndpoint } from "@shared/core";
import { zNewsTickerSummaryQuery } from "./schema/inputs.ts";

/** GET /news-ticker-summary - LLM-written 24-hour brief for a token. */
export default defineEndpoint({
    meta: {
        displayName: "Token 24h News Summary",
        summary: "AI summary of the last 24 hours of news for a token.",
        description: "Get a 24-hour news summary for a token or project " +
            "(symbol or name), combining Gloria's news data with web " +
            "search into decision-grade bullet points for fund managers " +
            "and trading agents.",
        docsUrl:
            "https://github.com/cryptobriefing/gloria-docs/blob/main/docs/gloria-data-platform/api-integration.md#get-news-ticker-summary",
        categories: ["crypto-signals", "news-search"],
    },
    endpoint: "/news-ticker-summary",
    request: { method: "GET", path: "/news-ticker-summary" },
    input: { schema: { queryParams: zNewsTickerSummaryQuery } },
});
