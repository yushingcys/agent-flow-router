import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_finance_markets` engine query parameters (https://serpapi.com/google-finance-markets,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleFinanceMarketsQuery = z.strictObject({
    trend: z.string().min(1).describe(
        "Retrieving different market trends. Due to a recent Google Finance update, this parameter now only accepts indexes as a valid value.",
    ),
    hl: z.string().describe(
        "The language to use for the Google Finance Markets search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    gl: z.string().describe(
        "The country to use for the Google Finance Markets search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France).",
    ).optional(),
    ...serpApiParams,
});
