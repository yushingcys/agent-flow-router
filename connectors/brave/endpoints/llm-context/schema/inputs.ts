import { z } from "zod";
import {
    zBraveCountry,
    zBraveFreshness,
    zBraveGoggles,
    zBraveQ,
    zBraveSafesearch,
    zBraveSearchLang,
    zBraveSpellcheck,
} from "../../../schema/common.ts";

/** GET /res/v1/llm/context query params (API reference, 2026-10-23). */
export const zBraveLlmContextQuery = z.object({
    q: zBraveQ(600, 75),
    country: zBraveCountry.optional(),
    search_lang: zBraveSearchLang.optional(),
    count: z.number().int().min(1).max(50).describe(
        "Search results considered when selecting context, 1-50 (vendor " +
            "default 20).",
    ).optional(),
    safesearch: zBraveSafesearch.describe(
        "Adult-content filter for the results used as context. Unset " +
            "means no filtering.",
    ).optional(),
    spellcheck: zBraveSpellcheck.optional(),
    maximum_number_of_urls: z.number().int().min(1).max(50).describe(
        "Most distinct URLs in the context, 1-50 (vendor default 20).",
    ).optional(),
    maximum_number_of_tokens: z.number().int().min(1024).max(32768)
        .describe(
            "Approximate token budget for the whole context, 1024-32768 " +
                "(vendor default 8192).",
        ).optional(),
    maximum_number_of_snippets: z.number().int().min(1).max(256).describe(
        "Most snippets in the context, 1-256 (vendor default 50).",
    ).optional(),
    maximum_number_of_tokens_per_url: z.number().int().min(512).max(8192)
        .describe(
            "Token cap per URL, 512-8192 (vendor default 4096).",
        ).optional(),
    maximum_number_of_snippets_per_url: z.number().int().min(1).max(100)
        .describe(
            "Snippet cap per URL, 1-100 (vendor default 50).",
        ).optional(),
    context_threshold_mode: z.enum([
        "disabled",
        "strict",
        "balanced",
        "lenient",
    ]).describe(
        "How strictly content must match the query to be included.",
    ).optional(),
    goggles: zBraveGoggles.optional(),
    freshness: zBraveFreshness.optional(),
    enable_local: z.boolean().describe(
        "Enable local (places) recall. Unset auto-detects from location " +
            "headers, which this connector does not send.",
    ).optional(),
    enable_source_metadata: z.boolean().describe(
        "Add site_name, favicon, thumbnail, description, and fetch " +
            "timestamp to each entry in `sources` (vendor default false).",
    ).optional(),
}).strict();
