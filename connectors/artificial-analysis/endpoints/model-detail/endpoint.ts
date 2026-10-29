import { defineEndpoint } from "@shared/core";
import { zModelDetailPath, zModelDetailQuery } from "./schema/inputs.ts";

/** GET /language/models/{slug} - Pro and Commercial keys only. */
export default defineEndpoint({
    meta: {
        displayName: "Get Language Model Detail",
        summary: "Full benchmark, pricing, and performance record for one " +
            "LLM.",
        description: "Get one language model by slug with every " +
            "per-benchmark score, evaluation token counts, full pricing " +
            "(including blended and cache prices), performance " +
            "percentiles, context window, parameters, modalities, and " +
            "licensing. Commercial keys also get the per-provider " +
            "breakdown (`providers`).",
        docsUrl:
            "https://artificialanalysis.ai/data-api/docs/reference#getLanguageModelBySlug",
        notes: [
            "Needs a Pro or Commercial key: a Free key answers 403.",
            "An unknown slug answers 404 `Model not found: <slug>`.",
        ],
    },
    endpoint: "/get_model_detail",
    request: { method: "GET", path: "/language/models/{slug}" },
    input: {
        schema: {
            pathParams: zModelDetailPath,
            queryParams: zModelDetailQuery,
        },
    },
});
