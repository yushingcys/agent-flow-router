import { defineEndpoint } from "@shared/core";
import { JINA_TOKEN_MODEL } from "../../schema/usage.ts";
import { zJinaReadBody } from "./schema/inputs.ts";

const shape = zJinaReadBody.shape;

/**
 * `POST https://r.jina.ai/` — one URL to LLM-friendly markdown.
 *
 * Reader bills the tokens of the returned content, unknowable before the
 * page is read, so the caller states the ceiling: `tokenBudget` is
 * REQUIRED (D25 limiting knob) and IS the estimate. Jina enforces it
 * server-side (verified keyless 2026-10-23: budget 10 on a 341-token
 * page answered 409 BudgetExceededError), so the claim never exceeds the
 * reservation.
 */
export default defineEndpoint({
    meta: {
        displayName: "Jina Reader",
        summary: "Read a URL or PDF as clean, LLM-ready markdown.",
        description: "Fetch a web page or PDF and return its main content " +
            "as clean markdown with title, description, and URL. Scope " +
            "extraction with CSS selectors ('targetSelector', " +
            "'removeSelector'), wait for dynamic content " +
            "('waitForSelector'), caption images with a vision model " +
            "('withGeneratedAlt'), or append link and image summaries. " +
            "'respondWith' switches to raw HTML, plain text, a screenshot " +
            "URL, or OCR parsing for complex documents. Set 'tokenBudget' " +
            "to the most this page may cost: Reader bills the tokens of " +
            "what it returns. Use this when you already know the URL; use " +
            "jina#search to find pages.",
        docsUrl: "https://jina.ai/reader",
        categories: ["web-scraping"],
        notes: [
            "Billed by output tokens; a page larger than 'tokenBudget' " +
            "fails with 409 BudgetExceededError instead of being truncated.",
            "'retainImages: none' and 'targetSelector' cut token usage on " +
            "busy pages.",
        ],
    },
    endpoint: "/read",
    request: { method: "POST", path: "/" },
    input: {
        schema: {
            body: zJinaReadBody.extend({
                tokenBudget: shape.tokenBudget.unwrap().min(1),
                timeout: shape.timeout.unwrap().positive().max(180)
                    .optional(),
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
