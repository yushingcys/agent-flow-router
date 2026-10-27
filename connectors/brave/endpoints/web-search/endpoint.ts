import { defineEndpoint } from "@shared/core";
import { zBraveWebSearchQuery } from "./schema/inputs.ts";

/** GET /res/v1/web/search — human-oriented results page data. */
export default defineEndpoint({
    meta: {
        displayName: "Brave Web Search",
        summary: "Search the web from Brave's independent index.",
        description: "Search Brave's web index and get ranked web " +
            "results (title, URL, description, age, optional extra " +
            "snippets), plus, when relevant, news, videos, discussions, " +
            "FAQs, an infobox, and locations in the same response. " +
            "Narrow with `result_filter`, page with `count` (1-20) and " +
            "`offset` (0-9), and filter by country, language, " +
            "freshness, and safe search. For grounding a model, " +
            "brave#res/v1/llm/context returns extracted passages instead.",
        docsUrl:
            "https://api-dashboard.search.brave.com/api-reference/web/search/get",
        categories: ["web-search"],
        notes: [
            "`count` limits web results only; the other sections size " +
            "themselves.",
        ],
    },
    request: { method: "GET", path: "/res/v1/web/search" },
    input: { schema: { queryParams: zBraveWebSearchQuery } },
});
