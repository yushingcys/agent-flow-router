import { defineEndpoint } from "@shared/core";
import { zNewsQuery } from "./schema/inputs.ts";

/** GET /news - the curated news feed, newest first. */
export default defineEndpoint({
    meta: {
        displayName: "Latest News by Category",
        summary: "Latest curated crypto and markets headlines for feed " +
            "categories, with sentiment and context.",
        description: "Get the latest curated news items for one or more " +
            "feed categories (crypto, bitcoin, defi, macro, ai_agents, " +
            "...), newest first. Each item carries the headline, " +
            "sentiment and its score, short and long context, source " +
            "links, the original post, mentioned tokens, ticker tags, " +
            "and the narrative it belongs to. Filter by date range, " +
            "keyword, tickers, asset class, or public asset id; page " +
            "with after or page.",
        docsUrl:
            "https://github.com/cryptobriefing/gloria-docs/blob/main/docs/gloria-data-platform/api-integration.md#get-news",
        categories: ["news-search", "crypto-signals"],
    },
    endpoint: "/news",
    request: { method: "GET", path: "/news" },
    input: { schema: { queryParams: zNewsQuery } },
});
