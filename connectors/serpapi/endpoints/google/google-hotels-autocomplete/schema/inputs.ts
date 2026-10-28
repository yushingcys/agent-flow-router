import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_hotels_autocomplete` engine query parameters (https://serpapi.com/google-hotels-autocomplete-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleHotelsAutocompleteQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The search query. A query that would be used to provide completion options.",
    ),
    gl: z.string().describe(
        "The country to use for the Google Hotels Autocomplete search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France)",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google Hotels Autocomplete search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    currency: z.string().describe(
        "The currency used in serpapi_google_hotels_link. Default value is USD.",
    ).optional(),
    ...serpApiParams,
});
