import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_trends_autocomplete` engine query parameters (https://serpapi.com/google-trends-autocomplete,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleTrendsAutocompleteQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The query you want to search. You can use anything that you would use in a regular Google Trends search. The query is used to retrieve suggested searches.",
    ),
    hl: z.string().describe(
        "The language to use for the Google Trends Autocomplete search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    ...serpApiParams,
});
