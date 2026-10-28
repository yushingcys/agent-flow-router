import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_maps_reviews` engine query parameters (https://serpapi.com/google-maps-reviews-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleMapsReviewsQuery = z.strictObject({
    data_id: z.string().describe(
        "The Google Maps data ID. Find the data ID by using our Google Maps API. Either data_id or place_id should be set.",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google Maps Reviews search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    place_id: z.string().describe(
        "The unique reference to a place on a Google Map. Place IDs are available for most locations, including businesses, landmarks, parks, and intersections. You can find the place_id using our Google Maps API. You can read more about Place IDs here. Either data_id or place_id should be set.",
    ).optional(),
    sort_by: z.string().describe(
        "Parameter is used to sort and refine the results. Available options: qualityScore - the most relevant reviews (default). newestFirst - the most recent reviews. ratingHigh - the highest rating reviews. ratingLow - the lowest rating reviews. The total number of reviews returned may vary depending on the sorting option selected.",
    ).optional(),
    topic_id: z.string().describe(
        "The ID of the topic you want to use for filtering reviews. You can access IDs inside our structured JSON response. topic_id and query parameters can't be used together.",
    ).optional(),
    query: z.string().describe(
        "A text query you want to use for filtering reviews. query and topic_id parameters can't be used together.",
    ).optional(),
    num: z.number().describe(
        "The maximum number of results to return. It ranges from 1 to 20. It defaults to 10.",
    ).optional(),
    next_page_token: z.string().describe(
        "The next page token. It is used for retrieving the next page results. The next page token can be found in the SerpApi JSON response: serpapi_pagination -> next_page_token Usage of start parameter (results offset) has been discontinued by Google.",
    ).optional(),
    ...serpApiParams,
});
