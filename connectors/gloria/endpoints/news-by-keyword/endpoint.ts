import { defineEndpoint } from "@shared/core";
import { zNewsByKeywordQuery } from "./schema/inputs.ts";

/** GET /news?keyword= - Monid's x402 `/news-by-keyword` is the REST news
 *  feed with a required keyword. */
export default defineEndpoint({
    meta: {
        displayName: "Search News by Keyword",
        summary: "Search curated crypto and markets news by keyword.",
        description: "Search Gloria's curated news feed for a keyword " +
            "and get the matching items newest first, each with " +
            "headline, sentiment, context, sources, mentioned tokens, " +
            "and ticker tags. Narrow by feed category, dates, tickers, " +
            "or asset class.",
        docsUrl:
            "https://github.com/cryptobriefing/gloria-docs/blob/main/docs/gloria-data-platform/api-integration.md#get-news",
        categories: ["news-search"],
    },
    endpoint: "/news-by-keyword",
    request: { method: "GET", path: "/news" },
    input: { schema: { queryParams: zNewsByKeywordQuery } },
});
