import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_hotels_reviews` engine query parameters (https://serpapi.com/google-hotels-reviews-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleHotelsReviewsQuery = z.strictObject({
    property_token: z.string().min(1).describe(
        "The specific property. You can find property_token from Google Hotels Properties API.",
    ),
    hl: z.string().describe(
        "The language to use for the Google Hotels search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    category_token: z.string().describe(
        "Parameter is used to get reviews filtered by a specific category. You can find category_token from Google Hotels API under reviews_breakdown.",
    ).optional(),
    sort_by: z.string().describe(
        "The sorting order of the reviews. Available options: 1 - Most helpful (Default) 2 - Most recent 3 - Highest score 4 - Lowest score",
    ).optional(),
    source_number: z.string().describe(
        "Parameter filters the reviews based on their originating source. Standard options (always available): 0 - All reviews (Default) -1 - Google For property-specific source numbers, refer to the other_reviews field in Google Hotels Property Details API. Available sources vary by property.",
    ).optional(),
    next_page_token: z.string().describe(
        "The next page token. It is used for retrieving the next page results.",
    ).optional(),
    ...serpApiParams,
});
