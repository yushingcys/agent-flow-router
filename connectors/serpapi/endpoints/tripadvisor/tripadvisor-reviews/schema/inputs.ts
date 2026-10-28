import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `tripadvisor_reviews` engine query parameters (https://serpapi.com/tripadvisor-reviews-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zTripadvisorReviewsQuery = z.strictObject({
    place_id: z.string().min(1).describe(
        "The Tripadvisor place ID. To extract the ID of a place, you can use our Tripadvisor Search API. NOTE: Tripadvisor has discontinued support for Vacation Rentals. As a result, requesting details for a Vacation Rental place_id may return incomplete data or no data at all.",
    ),
    tripadvisor_domain: z.string().describe(
        "The Tripadvisor domain to use. It defaults to www.tripadvisor.com.",
    ).optional(),
    language: z.string().describe(
        "The language to use for the Tripadvisor reviews. Head to Tripadvisor reviews languages for a full list of supported Tripadvisor Reviews languages.",
    ).optional(),
    sort_by: z.string().describe(
        "The sorting order of the results. Available options: most_recent - Most Recent (Default) detailed_review - Detailed Reviews",
    ).optional(),
    rating: z.string().describe(
        "To include only results with specified ratings. Example for single rating only: 5 Example for multiple ratings (separated by comma ,): 5,3,2",
    ).optional(),
    month: z.string().describe(
        "To include only results from a specific months. Each month is represented by a number from 1 (January) to 12 (December). Example for single month only: 1 (for January) Example for multiple months (separated by comma ,): 1,6,12",
    ).optional(),
    type_of_visit: z.string().describe(
        "To include only results from a specific types of visit. Available options: Business - Business Couples - Couples Family - Family Friends - Friends Solo - Solo To include multiple types of visit, separate values with a comma , (e.g. Business,Couples to include reviews from 'Business' and 'Couples' types of visit).",
    ).optional(),
    offset: z.number().describe(
        "The result offset. It skips the given number of reviews. It's used for pagination. (e.g., 0 (default) is the first page of results, 10 is the 2nd page of results, 20 is the 3rd page of results, etc.).",
    ).optional(),
    limit: z.number().describe(
        "The maximum number of reviews to return. The maximum value is 20. (e.g., 10 (default) returns 10 results, 20 returns 20 results, etc.).",
    ).optional(),
    ...serpApiParams,
});
