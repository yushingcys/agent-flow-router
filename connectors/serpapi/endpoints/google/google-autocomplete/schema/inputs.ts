import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_autocomplete` engine query parameters (https://serpapi.com/google-autocomplete-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleAutocompleteQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The search query. A query that would be used to provide completion options.",
    ),
    gl: z.string().describe(
        "The country to use for the Google search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France)",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google Autocomplete search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    cp: z.string().describe(
        "Cursor pointer defines the position of cursor for the query provided, position starts from 0 which is a case where cursor is placed before the query |query. If not provided acts as cursor is placed in the end of query query|.",
    ).optional(),
    client: z.string().describe(
        "Parameter used to define client for autocomplete. List of supported clients.",
    ).optional(),
    ...serpApiParams,
});
