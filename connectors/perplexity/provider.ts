import { defineProvider, presets } from "@shared/core";

/**
 * Perplexity (docs.perplexity.ai) - web-grounded answers from the Agent API
 * (the successor of Sonar Chat Completions) and raw ranked results from the
 * Search API, on `https://api.perplexity.ai`, Bearer auth.
 *
 * Perplexity prices everything in US dollars, so the pool is dollars.
 * Errors are non-2xx `{ error: { message, type?, code? } }` bodies, or a
 * 422 `{ detail: [...] }` validation body.
 */
export default defineProvider({
    name: "perplexity",
    meta: {
        displayName: "Perplexity",
        summary:
            "Web-grounded answers with cited sources, and ranked web search results.",
        description: "Perplexity runs real-time web search and answers " +
            "questions from what it finds. Its Sonar model writes an " +
            "answer grounded in live web results and returns the sources " +
            "it used, and can fetch specific pages for fuller context. " +
            "The Search API returns Perplexity's ranked web results " +
            "directly - title, URL, extracted snippet and dates - with " +
            "domain, date, recency, country and language filters, for " +
            "code or models that read the sources themselves.",
        homepageUrl: "https://www.perplexity.ai",
        docsUrl: "https://docs.perplexity.ai",
        categories: ["ai-search", "web-search"],
        notes: [
            "Billed in US dollars at Perplexity's published API prices. " +
            "Failed, invalid and rate-limited requests are not charged.",
            "Date filters take MM/DD/YYYY; results report dates as " +
            "YYYY-MM-DD.",
        ],
    },
    auth: { inject: presets.auth.bearer() },
    request: {
        baseUrl: "https://api.perplexity.ai",
        headers: { Accept: "application/json" },
    },
    timeouts: { requestMs: 60_000, runMs: 60_000 },
    usage: { credits: { default: { label: "US dollars" } } },
    output: {
        fromError: ({ data, utils }) => {
            const message = utils.json.optionalGet(
                data.output,
                "$.error.message",
            );
            const code = utils.json.optionalGet(data.output, "$.error.code");
            return {
                message: typeof message === "string" && message !== ""
                    ? message
                    : "Perplexity API error",
                ...(typeof code === "string" || typeof code === "number"
                    ? { code: String(code) }
                    : {}),
                raw: data.output,
            };
        },
    },
});
