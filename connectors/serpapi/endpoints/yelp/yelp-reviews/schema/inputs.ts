import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `yelp_reviews` engine query parameters (https://serpapi.com/yelp-reviews-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zYelpReviewsQuery = z.strictObject({
    place_id: z.string().min(1).describe(
        "The Yelp ID of a place. Each place has two unique IDs (e.g. ED7A7vDdg8yLNKJTSVHHmg and arabica-brooklyn). Only the first ID type is supported (e.g. ED7A7vDdg8yLNKJTSVHHmg). To extract the ID of a place, you can use our Yelp Search API.",
    ),
    yelp_domain: z.string().describe(
        "The Yelp domain to use. It defaults to yelp.com.",
    ).optional(),
    hl: z.string().describe(
        "The language to use for sorting Yelp Reviews. It's a two-letter language code. (e.g., en for English, es for Spanish, or fr for French)",
    ).optional(),
    q: z.string().describe(
        "The query you want to use to search through Yelp Reviews.",
    ).optional(),
    sortby: z.string().describe(
        "Sorting results. Available options: relevance_desc - Yelp Sort (default) date_desc - Newest First date_asc - Oldest Rated rating_desc - Highest Rated rating_asc - Lowest Rated elites_desc - Elites",
    ).optional(),
    rating: z.string().describe(
        "Parameter filters out the results by rating. Possible values are 5, 4, 3, 2, and 1. All results are included by default. To only show results with the five star rating, the value should be set to 5 To include results with multiple ratings, the value should for example be set to 5,4,3 (each rating separated by comma ,).",
    ).optional(),
    not_recommended: z.boolean().describe(
        "Parameter fetches reviews that are not recommended by Yelp. It can be set to true to only show not recommended reviews, or false to show recommended reviews. By default, only recommended reviews are shown.",
    ).optional(),
    start: z.number().describe(
        "The result offset. It skips the given number of results. It's used for pagination. (e.g., 0 (default) is the first page of results, 49 is the 2nd page of results, 98 is the 3rd page of results, etc.).",
    ).optional(),
    num: z.number().describe(
        "The maximum number of results to return. 49 (default) returns 49 results. Maximum number of results to return is 49.",
    ).optional(),
    not_recommended_start: z.number().describe(
        "The result offset. It skips the given number of results. It's used for pagination. (e.g., 0 (default) is the first page of results, 10 is the 2nd page of results, 20 is the 3rd page of results, etc.). The not_recommended_start parameter can only be used with the not_recommended parameter set to true.",
    ).optional(),
    ...serpApiParams,
});
