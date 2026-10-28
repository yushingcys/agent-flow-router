import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `apple_reviews` engine query parameters (https://serpapi.com/apple-reviews,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zAppleAppStoreReviewsQuery = z.strictObject({
    product_id: z.string().min(1).describe(
        'The ID of a product you want to get the reviews for. You can find the ID of a product from App Store API json results, You can also get it from the URL of the app. For example product_id of "https://apps.apple.com/us/app/the-great-coffee-app/id534220544", is the long numerical value that comes after "id", 534220544 (default).',
    ),
    country: z.string().describe(
        "The country to use for the search. It's a two-letter country code. (e.g., us (default) for the United States, uk for United Kingdom, or fr for France).",
    ).optional(),
    page: z.number().describe(
        "Parameter is used to get the items on a specific page. (e.g., 1 (default) is the first page of results, 2 is the 2nd page of results, 3 is the 3rd page of results, etc.).",
    ).optional(),
    sort: z.string().describe(
        "Sorting reviews for the iOS App Store (iPhone and iPad). It can be set to: mostrecent: Most recent (default), mosthelpful: Most helpful, mostfavorable: Most favorable, mostcritical: Most critical This parameter has no effect on the macOS App Store. Reviews from the macOS App Store will always be sorted from most recent to least recent.",
    ).optional(),
    ...serpApiParams,
});
