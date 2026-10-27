import { defineEndpoint } from "@shared/core";
import { JINA_TOKEN_MODEL } from "../../schema/usage.ts";
import { zJinaRerankBody } from "./schema/inputs.ts";

/**
 * `POST https://api.jina.ai/v1/rerank` — score documents against a query.
 *
 * Rerank bills input tokens (`usage.total_tokens`), which depend on the
 * model's tokenizer, so the estimate is a CEILING deduced from the input:
 * every document scored as its own query+document pair, 3 tokens per
 * UTF-16 code unit (a byte-level tokenizer emits at most one token per
 * UTF-8 byte, and a code unit is at most 3 bytes), plus 8 special tokens
 * per pair. Real English text runs ~4 characters per token, so this
 * over-reserves; the vendor's claim settles.
 */
export default defineEndpoint({
    meta: {
        displayName: "Jina Reranker",
        summary: "Rank documents by relevance to a query.",
        description: "Score a list of text documents against a query with " +
            "Jina's multilingual reranker models and return them sorted by " +
            "relevance, each with its original index and a relevance " +
            "score. Use it to reorder search results or retrieved chunks " +
            "before handing the best ones to an LLM. 'top_n' trims the " +
            "list; 'return_documents: false' returns indexes and scores " +
            "only.",
        docsUrl: "https://jina.ai/reranker",
        categories: ["reranking"],
        notes: [
            "Billed by input tokens: the query and every document count, " +
            "whatever 'top_n' returns.",
            "'max_doc_length' is accepted only by the v3 models.",
        ],
    },
    request: {
        method: "POST",
        path: "/v1/rerank",
        baseUrl: "https://api.jina.ai",
    },
    input: { schema: { body: zJinaRerankBody } },
    timeouts: { requestMs: 60_000, runMs: 65_000 },
    usage: {
        model: JINA_TOKEN_MODEL,
        estimate: ({ data }) => {
            const body = data.input.body;
            let tokens = 0;
            for (const doc of body.documents) {
                tokens += 3 * (body.query.length + doc.length) + 8;
            }
            return { counts: { TOKEN: tokens } };
        },
    },
});
