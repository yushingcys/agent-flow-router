import { z } from "zod";
import { zFilterFields } from "../../../schema/filters.ts";

/** Perplexity POST /search request body (`ApiSearchRequest`, OpenAPI
 *  mirror). Optionality only: the vendor defaults (max_results 10,
 *  search_type web) are documented, not applied (D25). */
export const zSearchBody = z.strictObject({
    query: z.union([
        z.string().min(1),
        z.array(z.string().min(1)).min(1).max(5),
    ]).describe(
        "One query, or up to 5 related queries run independently in one " +
            "request (one billing unit).",
    ),
    max_results: z.number().int().min(1).max(50).describe(
        "Results to return: 1-20 for web search, up to 50 for people search.",
    ).optional(),
    search_type: z.enum(["web", "fast", "people"]).describe(
        "web = standard search, fast = lower-latency and cheaper, " +
            "people = People Search backend.",
    ).optional(),
    max_tokens: z.number().int().min(1).max(1_000_000).describe(
        "Maximum total page-content tokens returned across all results.",
    ).optional(),
    max_tokens_per_page: z.number().int().min(1).max(1_000_000).describe(
        "Maximum page-content tokens extracted from each result.",
    ).optional(),
    country: z.string().length(2).describe(
        "ISO 3166-1 alpha-2 country code to localize results.",
    ).optional(),
    search_language_filter: z.array(z.string().length(2)).max(20).describe(
        "ISO 639-1 language codes; only results in these languages.",
    ).optional(),
    ...zFilterFields,
});
