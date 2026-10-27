import { z } from "zod";
import {
    zBraveCountry,
    zBraveExtraSnippets,
    zBraveFetchMetadata,
    zBraveFreshness,
    zBraveGoggles,
    zBraveOperators,
    zBraveQ,
    zBraveSafesearch,
    zBraveSearchLang,
    zBraveSpellcheck,
    zBraveUiLang,
} from "../../../schema/common.ts";

/** GET /res/v1/web/search query params (API reference, 2026-10-23). */
export const zBraveWebSearchQuery = z.object({
    q: zBraveQ(600, 75),
    country: zBraveCountry.optional(),
    search_lang: zBraveSearchLang.optional(),
    ui_lang: zBraveUiLang.optional(),
    count: z.number().int().min(1).max(20).describe(
        "Web results per page, 1-20 (vendor default 20). Applies to web " +
            "results only; fewer may be returned.",
    ).optional(),
    offset: z.number().int().min(0).max(9).describe(
        "Zero-based page index, in pages of `count` (0-9). Page only " +
            "while `query.more_results_available` is true.",
    ).optional(),
    safesearch: zBraveSafesearch.describe(
        "Adult-content filter: off, moderate (vendor default), strict.",
    ).optional(),
    spellcheck: zBraveSpellcheck.optional(),
    freshness: zBraveFreshness.optional(),
    text_decorations: z.boolean().describe(
        "Include highlighting markers in snippets (vendor default true).",
    ).optional(),
    result_filter: z.string().describe(
        "Comma-separated result types to include: discussions, faq, " +
            "infobox, news, query, summarizer, videos, web, locations. " +
            "Omit for all.",
    ).optional(),
    units: z.enum(["metric", "imperial"]).describe(
        "Measurement units for results.",
    ).optional(),
    goggles: zBraveGoggles.optional(),
    extra_snippets: zBraveExtraSnippets.optional(),
    include_fetch_metadata: zBraveFetchMetadata.optional(),
    operators: zBraveOperators.optional(),
}).strict();
