import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_maps_contributor_reviews` engine query parameters (https://serpapi.com/google-maps-contributor-reviews-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleMapsContributorReviewsQuery = z.strictObject({
    contributor_id: z.string().min(1).describe(
        "The Google Maps Contributor ID. It's a series of digits which can be found in the contributor reviews URL. For example, the contributor ID for the URL https://www.google.com/maps/contrib/110382514725174877672/reviews is 110382514725174877672. It can also be found by using our Google Maps Place Results API and Google Maps Reviews API.",
    ),
    gl: z.string().describe(
        "The country to use for the Google Maps Contributor Reviews search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France).",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google Maps Contributor Reviews search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    num: z.number().describe(
        "The maximum number of results to return. (e.g., 10 (default) returns 10 results, and 200 returns 200 results). This parameter should not be larger than 200.",
    ).optional(),
    ...serpApiParams,
});
