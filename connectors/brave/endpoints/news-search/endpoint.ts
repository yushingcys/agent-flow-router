import { defineEndpoint } from "@shared/core";
import { zBraveNewsSearchQuery } from "./schema/inputs.ts";

/** GET /res/v1/news/search — news articles. */
export default defineEndpoint({
    meta: {
        displayName: "Brave News Search",
        summary: "Search recent news articles from Brave's index.",
        description: "Search news and get articles with title, URL, " +
            "description, publisher, age, thumbnail, a `breaking` flag, " +
            "and optional extra snippets. Use `freshness` (pd/pw/pm/py " +
            "or a date range) for 'latest' questions; page with `count` " +
            "(1-50) and `offset` (0-9).",
        docsUrl:
            "https://api-dashboard.search.brave.com/api-reference/news/news_search/get",
        categories: ["news-search"],
        notes: ["`safesearch` defaults to strict on news."],
    },
    request: { method: "GET", path: "/res/v1/news/search" },
    input: { schema: { queryParams: zBraveNewsSearchQuery } },
});
