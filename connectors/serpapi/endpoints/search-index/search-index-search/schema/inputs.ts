import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `search_index` engine query parameters (https://serpapi.com/search-index-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zSearchIndexSearchQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The query you want to search.",
    ),
    num: z.number().describe(
        "The number of results to return. (default: 10).",
    ).optional(),
    start: z.number().describe(
        "The result offset for pagination. (e.g., 0 (default) is the first page, 10 is the second page, etc.).",
    ).optional(),
    safe: z.string().describe(
        "The level of filtering for adult content. It can be set to active (default) or off.",
    ).optional(),
    mode: z.string().describe(
        "The search mode. Set to deep for expanded recall via parallel sub-query fan-out. Returns more diverse results by decomposing the query into multiple aspects.",
    ).optional(),
    type: z.string().describe(
        "The result type. It can be set to web (default) to return organic results; typed results may also appear when typed mixing is enabled. Use place, product, video, or publication to request one typed corpus directly.",
    ).optional(),
    ll: z.string().describe(
        "The anchor point for place results. It accepts @lat,lng, @lat,lng,14z, @lat,lng,250m, or lat,lng, and is only supported with type=place.",
    ).optional(),
    radius: z.number().describe(
        "The place search radius in kilometers. It must be greater than 0 and less than or equal to 20000, and requires ll.",
    ).optional(),
    product_source: z.string().describe(
        "Parameter restricts product results to one source. It is only supported with type=product.",
    ).optional(),
    as_ylo: z.string().describe(
        "The inclusive lower publication year. It must be a 4-digit year and is only supported with type=publication.",
    ).optional(),
    as_yhi: z.string().describe(
        "The inclusive upper publication year. It must be a 4-digit year and is only supported with type=publication.",
    ).optional(),
    gl: z.string().describe(
        "The country as a two-letter country code (e.g., us for the United States, de for Germany). Web results are ranked with a preference for the country. Product results are restricted to that market; without gl, products from all markets are searched.",
    ).optional(),
    hl: z.string().describe(
        "The language as a two or three-letter language code, optionally followed by a region code (e.g., en, fr, en-GB). Web results are ranked with a preference for the language.",
    ).optional(),
    ...serpApiParams,
});
