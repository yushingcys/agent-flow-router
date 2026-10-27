import { defineProvider, presets } from "@shared/core";
import { JINA_TOKEN_MODEL } from "./schema/usage.ts";

/**
 * Jina AI (jina.ai) — Reader, Search and Reranker for agents. Three
 * synchronous JSON endpoints on three hosts, one `Authorization: Bearer`
 * key for all of them:
 *   `POST https://r.jina.ai/`         -> `#read`      (URL to markdown)
 *   `POST https://s.jina.ai/search`   -> `#search`    (web search + page text)
 *   `POST https://api.jina.ai/v1/rerank` -> `#v1/rerank`
 * Request shapes follow the vendors' own OpenAPI documents
 * (r.jina.ai/openapi.json, s.jina.ai/openapi.json,
 * api.jina.ai/openapi.json, 2026-10-23). Reader and Search take every
 * option as a JSON body field (the `X-*` headers are aliases), verified
 * keyless 2026-10-23: `respondWith` and `tokenBudget` in the body take
 * effect.
 *
 * BILLING. Jina meters one token pool across all products: Reader bills
 * the tokens of the returned content, Search bills a fixed amount per
 * request starting at 10,000 tokens, Rerank bills the input tokens
 * (jina.ai/reader rate-limit table, 2026-10-23). Every response reports
 * its draw: Reader/Search at `meta.usage.tokens` (verified on a real
 * 2026-10-23 Reader response), Rerank at `usage.total_tokens`
 * (OpenAPI `RerankingResponse`). One PER_UNIT TOKEN line; the vendor's
 * claim settles. Failed requests are vendor non-2xx and bill nothing.
 */
export default defineProvider({
    name: "jina",
    meta: {
        displayName: "Jina AI",
        summary: "Read any URL as markdown, search the web, and rerank " +
            "documents.",
        description: "Jina AI's search foundation APIs for agents: Reader " +
            "turns any URL (HTML pages and PDFs) into clean, LLM-friendly " +
            "markdown, with CSS selector scoping, image captions, and " +
            "link/image summaries; Search queries the web and returns the " +
            "top results with each page's content already read; Reranker " +
            "scores a list of documents against a query with Jina's " +
            "multilingual reranker models. Billed in Jina tokens.",
        homepageUrl: "https://jina.ai",
        docsUrl: "https://jina.ai/reader",
        categories: ["web-scraping"],
        notes: [
            "Every endpoint bills Jina tokens as reported by the response; " +
            "failed requests are free.",
        ],
    },
    auth: { inject: presets.auth.bearer() },
    request: {
        baseUrl: "https://r.jina.ai",
        headers: { Accept: "application/json" },
    },
    /** Reader's page `timeout` accepts up to 180 s (OpenAPI validator
     *  `v > 0 && v <= 180`), so the transport must outlast it. */
    timeouts: { requestMs: 190_000, runMs: 200_000 },
    usage: {
        /** THE credit system (design D26): Jina's native meter is tokens,
         *  one pool shared by every product. */
        credits: { default: { label: "Jina tokens" } },
        model: JINA_TOKEN_MODEL,
        evidence: ({ data, utils }) => {
            const tokens =
                utils.json.optionalNum(data.output, "$.meta.usage.tokens") ??
                    utils.json.optionalNum(data.output, "$.usage.total_tokens");
            return { counts: { TOKEN: tokens ?? 0 } };
        },
        /** The vendor's own claim (design D27): Reader/Search report it in
         *  the `meta` envelope, Rerank in a top-level `usage`. Both
         *  receipts are plucked; Reader's per-page `data.usage` stays as
         *  provenance. Entry OMITTED when absent (never `?? 0`). */
        consolidate: ({ data, utils }) => {
            const tokens =
                utils.json.optionalNum(data.output, "$.meta.usage.tokens") ??
                    utils.json.optionalNum(data.output, "$.usage.total_tokens");
            const meta = utils.json.pluck(data.output, "$.meta");
            const usage = utils.json.pluck(meta.rest, "$.usage");
            return {
                credits: {
                    ...(tokens !== undefined ? { default: tokens } : {}),
                },
                output: usage.rest,
            };
        },
    },
    output: {
        /** Reader/Search wrap results as `{code, status, data}`; `code`
         *  mirrors the HTTP status, so the envelope unwraps to `data`.
         *  Rerank has no envelope and passes through. */
        fromResponse: ({ data, utils }) => {
            const inner = utils.json.optionalGet(data.output, "$.data");
            return inner === undefined ? data.output : inner;
        },
        /** Two error envelopes: Reader/Search answer
         *  `{data: null, code, name, status, message, readableMessage}`,
         *  api.jina.ai answers `{detail, request_id, code}` (both recorded
         *  2026-10-23 without a key). */
        fromError: ({ data, utils }) => {
            const message = utils.json.optionalGet(data.output, "$.message");
            const detail = utils.json.optionalGet(data.output, "$.detail");
            const name = utils.json.optionalGet(data.output, "$.name");
            const code = utils.json.optionalGet(data.output, "$.code");
            const errorCode = typeof name === "string" ? name : code;
            return {
                message: typeof message === "string" && message !== ""
                    ? message
                    : typeof detail === "string" && detail !== ""
                    ? detail
                    : "Jina API error",
                ...(typeof errorCode === "string" ? { code: errorCode } : {}),
                raw: data.output,
            };
        },
    },
});
