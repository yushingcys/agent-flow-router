import { z } from "zod";

/**
 * `POST https://api.jina.ai/v1/rerank` body — the text request shapes
 * `TextRerankerRequest` and `RerankerV3Request` (api.jina.ai/openapi.json,
 * 2026-10-23) merged under one `model` enum. Documents are plain strings
 * (the vendor also accepts `{text}` objects, which add nothing); the
 * multimodal `jina-reranker-m0` is not exposed. Mirror carries
 * optionality only (D25).
 */
export const zJinaRerankBody = z.object({
    model: z.enum([
        "jina-reranker-v3",
        "jina-reranker-v3.5",
        "jina-reranker-v2-base-multilingual",
        "jina-reranker-v1-base-en",
        "jina-reranker-v1-turbo-en",
        "jina-reranker-v1-tiny-en",
        "jina-colbert-v2",
        "jina-colbert-v1-en",
    ]).describe(
        "Reranking model. 'jina-reranker-v3' / 'v3.5' are listwise and " +
            "multilingual; 'jina-reranker-v2-base-multilingual' scores " +
            "each document independently.",
    ),
    query: z.string().describe("The query to rank documents against."),
    documents: z.array(z.string()).min(1).describe(
        "Documents to rank, as plain text.",
    ),
    top_n: z.number().int().min(1).describe(
        "Return only the N most relevant documents (default: all).",
    ).optional(),
    return_documents: z.boolean().describe(
        "Include each document's text in the results (vendor default " +
            "true).",
    ).optional(),
    max_doc_length: z.number().int().min(1).max(8192).describe(
        "Maximum tokens per document, 1-8192 (v3 models only; default " +
            "2048 for v3, 8192 for v3.5).",
    ).optional(),
}).strict();
