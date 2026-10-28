import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_finance` engine query parameters (https://serpapi.com/google-finance-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleFinanceQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The query you want to search. It can be a stock, index, mutual fund, currency or futures.",
    ),
    hl: z.string().describe(
        "The language to use for the Google Finance search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    window: z.string().describe(
        "Setting time range for the graph. It can be set to: 1D - 1 Day(default) 5D - 5 Days 1M - 1 Month 6M - 6 Months YTD - Year to Date 1Y - 1 Year 5Y - 5 Years MAX - Maximum",
    ).optional(),
    ...serpApiParams,
});
