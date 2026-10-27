import { defineEndpoint } from "@shared/core";
import { JINA_TOKEN_MODEL } from "../../schema/usage.ts";
import { zJinaSearchBody } from "./schema/inputs.ts";

const shape = zJinaSearchBody.shape;

/**
 * `POST https://s.jina.ai/search` — web search with each result read.
 *
 * Jina bills "a fixed number of tokens, starting from 10,000" per search
 * (jina.ai/reader rate-limit table, 2026-10-23), so `tokenBudget` is
 * REQUIRED with a 10,000 floor and IS the estimate; the response's
 * `meta.usage.tokens` settles.
 */
export default defineEndpoint({
    meta: {
        displayName: "Jina Search",
        summary: "Search the web and get the top results as clean " +
            "markdown.",
        description: "Search the web and return the top results with " +
            "title, URL, description, and each result page's content " +
            "already read into LLM-friendly markdown, so one call grounds " +
            "an answer. Set 'respondWith: no-content' for a plain results " +
            "list. Narrow with 'site', country ('gl'), language ('hl'), " +
            "'location', or the 'news' / 'images' verticals, and page " +
            "with 'page'. Set 'tokenBudget' to the most this search may " +
            "cost (at least 10,000).",
        docsUrl: "https://jina.ai/reader",
        categories: ["web-search"],
        notes: [
            "Every search costs at least 10,000 tokens, with or without " +
            "page content; a search over 'tokenBudget' fails with 409 " +
            "BudgetExceededError and is not billed.",
        ],
    },
    request: {
        method: "POST",
        path: "/search",
        baseUrl: "https://s.jina.ai",
    },
    input: {
        schema: {
            body: zJinaSearchBody.extend({
                num: shape.num.unwrap().min(0).max(20).optional(),
                tokenBudget: shape.tokenBudget.unwrap().min(10_000),
            }),
        },
    },
    usage: {
        model: JINA_TOKEN_MODEL,
        estimate: ({ data }) => ({
            counts: { TOKEN: data.input.body.tokenBudget },
        }),
    },
});
