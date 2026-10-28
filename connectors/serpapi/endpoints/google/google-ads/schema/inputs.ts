import { z } from "zod";
import {
    serpApiParams,
    zDevice,
    zLocation,
} from "../../../../schema/common.ts";

/** `google_ads` engine query parameters (https://serpapi.com/google-ads-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleAdsQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The query you want to search. You can use anything that you would use in a regular Google search. e.g. inurl:, site:, intitle:.",
    ),
    location: zLocation,
    hl: z.string().describe(
        "The language to use for the Google search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    safe: z.string().describe(
        "The level of filtering for adult content. It can be set to active or off, by default Google will blur explicit content.",
    ).optional(),
    nfpr: z.string().describe(
        "The exclusion of results from an auto-corrected query when the original query is spelled wrong. It can be set to 1 to exclude these results, or 0 to include them (default). Note that this parameter may not prevent Google from returning results for an auto-corrected query if no other results are available.",
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
