import { defineEndpoint } from "@shared/core";
import { JINA_TOKEN_MODEL } from "../../schema/usage.ts";
import { zJinaSearchBody } from "./schema/inputs.ts";

const shape = zJinaSearchBody.shape;

/**
 * `POST https://s.jina.ai/search` — web search with each result read.
 *
 * Jina bills at least 10,000 tokens per search, plus the tokens of each
 * result page it reads; the response's `meta.usage.tokens` settles.
 * Search ignores the token budget ("ignored for the search endpoint",
 * s.jina.ai/openapi.json `X-Token-Budget`), so it cannot cap the cost:
 * production searches with a 10,000 budget settled at 18,700-83,600
 * tokens (2026-11-09). The estimate is a per-result ceiling instead.
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
            "with 'page'.",
        docsUrl: "https://jina.ai/reader",
        categories: ["web-search"],
        notes: [
            "Every search costs at least 10,000 tokens, plus the tokens " +
            "of each result page read; 'respondWith: no-content' costs " +
            "only the 10,000. Jina search ignores 'tokenBudget'.",
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
                tokenBudget: shape.tokenBudget.unwrap().describe(
                    "Ignored by Jina search; it does not cap the cost.",
                ).optional(),
            }),
        },
    },
    usage: {
        model: JINA_TOKEN_MODEL,
        // ponytail: 20,000 tokens per read page held the largest page seen
        // (83,600 for a default search); a longer page settles above it.
        estimate: ({ data }) => {
            const { num, respondWith } = data.input.body;
            const pages = respondWith === "no-content" ? 0 : num ?? 5;
            return { counts: { TOKEN: 10_000 + pages * 20_000 } };
        },
    },
});
