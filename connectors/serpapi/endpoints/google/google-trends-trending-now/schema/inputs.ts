import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_trends_trending_now` engine query parameters (https://serpapi.com/google-trends-trending-now,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleTrendsTrendingNowQuery = z.strictObject({
    geo: z.string().min(1).describe(
        "The location from where you want the search to originate. It defaults to US (activated when the value of geo parameter is not set or empty).",
    ),
    hours: z.string().describe(
        "The number of past hours to retrieve the results for. It defaults to 24 (Past 24 hours). The predefined value from Google are the following: -4 (Past 4 hours) -24 (Past 24 hours) -48 (Past 48 hours) -168 (Past 7 days).",
    ).optional(),
    category_id: z.string().describe(
        'Parameter allows results to be filtered by a specific category. E.g. category_id:18 will return only results from the "Technology" category.',
    ).optional(),
    only_active: z.string().describe(
        "Parameter filters results to only include those that are currently active.",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google Trends Trending Now search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    ...serpApiParams,
});
