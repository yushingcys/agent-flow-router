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

/** GET /res/v1/news/search query params (API reference, 2026-10-23). */
export const zBraveNewsSearchQuery = z.object({
    q: zBraveQ(400, 50),
    country: zBraveCountry.optional(),
    search_lang: zBraveSearchLang.optional(),
    ui_lang: zBraveUiLang.optional(),
    count: z.number().int().min(1).max(50).describe(
        "Results per page, 1-50 (vendor default 20).",
    ).optional(),
    offset: z.number().int().min(0).max(9).describe(
        "Zero-based page index, in pages of `count` (0-9).",
    ).optional(),
    safesearch: zBraveSafesearch.describe(
        "Adult-content filter: off, moderate, strict (vendor default).",
    ).optional(),
    spellcheck: zBraveSpellcheck.optional(),
    freshness: zBraveFreshness.optional(),
    goggles: zBraveGoggles.optional(),
    extra_snippets: zBraveExtraSnippets.optional(),
    include_fetch_metadata: zBraveFetchMetadata.optional(),
    operators: zBraveOperators.optional(),
}).strict();
