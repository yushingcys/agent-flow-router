import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `yelp` engine query parameters (https://serpapi.com/yelp-search-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zYelpSearchQuery = z.strictObject({
    find_desc: z.string().describe(
        "The query you want to search. You can use anything that you would use in a regular Yelp search.",
    ).optional(),
    find_loc: z.string().min(1).describe(
        "From where you want the search to originate. You can use any location you would use in a regular Yelp search. Following location formats are acceptable: - 706 Mission St, San Francisco, CA - San Francisco, CA - San Francisco, CA 94103 - 94103",
    ),
    l: z.string().describe(
        "The distance (map radius) or neighborhoods you want to search in. You can use our JSON endpoint to fetch values for either of them. Values for distance are accessible through filters.distance (e.g. value for 'Bird's-eye View' is g:-97.86003112792969,30.21635515266855,-97.65541076660156,30.394199462058317). You can also specify neighborhoods to search in.",
    ).optional(),
    yelp_domain: z.string().describe(
        "The Yelp domain to use. It defaults to yelp.com.",
    ).optional(),
    cflt: z.string().describe(
        "A category. It can be used alongside find_desc parameter to refine the search.",
    ).optional(),
    sortby: z.string().describe(
        "Sorting results. Available options: recommended - Recommended (default) rating - Highest Rated review_count - Most Reviewed",
    ).optional(),
    attrs: z.string().describe(
        "Refining results. You can add more filters like 'price', 'features', etc. to your search. You can use our JSON endpoint to fetch values. Values for filters are accessible through filters (e.g. value for filtering results by 'No Smoking' is Smoking.no). You can also use multiple values: filters.features[0].value,filters.features[1].value (e.g. GoodForKids,DogsAllowed)",
    ).optional(),
    start: z.number().describe(
        "The result offset. It skips the given number of results. It's used for pagination. (e.g., 0 (default) is the first page of results, 10 is the 2nd page of results, 20 is the 3rd page of results, etc.).",
    ).optional(),
    ...serpApiParams,
});
