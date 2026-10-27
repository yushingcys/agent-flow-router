import { z } from "zod";

/**
 * Query parameters the Brave search endpoints share (API reference,
 * api-dashboard.search.brave.com/api-reference, 2026-10-23). Mirror
 * carries optionality only (D25). Country and language codes stay plain
 * strings: Brave 422s a code outside its list.
 */
export const zBraveQ = (maxChars: number, maxWords: number) =>
    z.string().min(1).max(maxChars).describe(
        `The search query. At most ${maxChars} characters and ` +
            `${maxWords} words. Search operators (site:, filetype:, ` +
            `"exact phrase", -exclude) go here.`,
    );

export const zBraveCountry = z.string().describe(
    "2-letter country code the results come from (vendor default US).",
);

export const zBraveSearchLang = z.string().describe(
    "Language code of the results, e.g. en, de, ja (vendor default en).",
);

export const zBraveUiLang = z.string().describe(
    "Language of response metadata, <language>-<country> e.g. en-US " +
        "(vendor default en-US).",
);

export const zBraveSpellcheck = z.boolean().describe(
    "Spell-check the query (vendor default true); the corrected query " +
        "is used and reported in `query.altered`.",
);

export const zBraveFreshness = z.string().describe(
    "Filter by page age: pd (24 hours), pw (7 days), pm (31 days), py " +
        "(365 days), or a range YYYY-MM-DDtoYYYY-MM-DD.",
);

export const zBraveGoggles = z.array(z.string()).max(3).describe(
    "Up to 3 Goggles (custom re-ranking): each a hosted Goggle URL or an " +
        "inline Goggle definition.",
);

export const zBraveExtraSnippets = z.boolean().describe(
    "Return up to 5 additional alternative excerpts per result.",
);

export const zBraveFetchMetadata = z.boolean().describe(
    "Include page fetch metadata (vendor default false).",
);

export const zBraveOperators = z.boolean().describe(
    "Apply search operators found in `q` (vendor default true).",
);

export const zBraveSafesearch = z.enum(["off", "moderate", "strict"]);
