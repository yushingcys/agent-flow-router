import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `home_depot_product_reviews` engine query parameters (https://serpapi.com/home-depot-product-reviews,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zHomeDepotProductReviewsQuery = z.strictObject({
    product_id: z.string().min(1).describe(
        "The Home Depot identifier of a product. Only Product IDs gathered from the Home Depot US are supported.",
    ),
    term: z.string().describe(
        "The term you want to search, only reviews with matching term will be returned.",
    ).optional(),
    rating: z.string().describe(
        "To include only results with specified ratings. Example for single rating only: 5 Example for multiple ratings (separated by comma ,): 5,3,2",
    ).optional(),
    sort_by: z.string().describe(
        "Sorting reviews. By default the reviews are sorted by newest. Available options: photoreview - Photo Reviews mosthelpfull - Most Helpful oldest - Oldest newest - Newest highestrating - Highest rating lowestrating - Lowest rating",
    ).optional(),
    verified_purchases: z.string().describe(
        "Whether to include reviews from verified purchases.",
    ).optional(),
    start: z.number().describe(
        "Parameter controls the offset of the reviews. This parameter defaults to 1. If the pagesize is 100, you have to specify start as 101 to get the 2nd page results, and the 3rd page is 201, and so on.",
    ).optional(),
    pagesize: z.number().describe(
        "Parameter determines the number of items per page. By default, 100 (maximum allowed value) results are returned.",
    ).optional(),
    ...serpApiParams,
});
