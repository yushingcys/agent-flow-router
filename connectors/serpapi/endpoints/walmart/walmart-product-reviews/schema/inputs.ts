import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `walmart_product_reviews` engine query parameters (https://serpapi.com/walmart-product-reviews-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zWalmartProductReviewsQuery = z.strictObject({
    product_id: z.string().min(1).describe(
        "The unique product identifier to get reviews of a specific product. You need to pass the us_item_id. It can be found from either Organic Results API or Product API results.",
    ),
    rating: z.string().describe(
        "Filtering reviews by rating. It can be set to: 1: 1-star, 2: 2-star, 3: 3-star, 4: 4-star, 5: 5-star.",
    ).optional(),
    sort: z.string().describe(
        "Sorting reviews. It can be set to: relevancy, helpful, submission-desc, submission-asc, rating-desc, rating-asc",
    ).optional(),
    page: z.number().describe(
        "Value is used to get the reviews on a specific page. (e.g., 1 (default) is the first page of results, 2 is the 2nd page of results, 3 is the 3rd page of results, etc.).",
    ).optional(),
    ...serpApiParams,
});
