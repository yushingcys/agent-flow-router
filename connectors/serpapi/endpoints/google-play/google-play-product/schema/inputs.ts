import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_play_product` engine query parameters (https://serpapi.com/google-play-product-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGooglePlayProductQuery = z.strictObject({
    product_id: z.string().min(1).describe(
        "The ID of a product you want to get the results for.",
    ),
    gl: z.string().describe(
        "The country to use for the Google Play search. It's a two-letter country code. (e.g., us (default) for the United States, uk for United Kingdom, or fr for France). You can find the full list of Google Play country availability here: Google Play Countries. Afterwards, head to the Google countries page page for a two-letter country code.",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google Play search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    store: z.string().min(1).describe(
        "The type of Google Play store. There are five types in total: apps (default), movies, tv, books and audiobooks store.",
    ),
    season_id: z.string().describe(
        "The ID of a season you want to get the results for. It should be used only when store parameter is set to tv. e.g. store=tv.",
    ).optional(),
    all_reviews: z.boolean().describe(
        "Retrieving all reviews of a product. It can be set to true or false (default).",
    ).optional(),
    platform: z.string().describe(
        "Filtering reviews by platform. It can be set to: phone: Phone (default), tablet: Tablet, watch: Watch, chromebook: Chromebook, tv: TV. It should be used only when all_reviews parameter is set to true.",
    ).optional(),
    rating: z.string().describe(
        "Filtering reviews by rating. It can be set to: 1: 1-star, 2: 2-star, 3: 3-star, 4: 4-star, 5: 5-star. It should be used only when all_reviews parameter is set to true.",
    ).optional(),
    sort_by: z.string().describe(
        "Sorting reviews by relevance. It can be set to: 1: Most relevant (default), 2: Newest, 3: Rating. It should be used only when all_reviews parameter is set to true.",
    ).optional(),
    num: z.number().describe(
        "The maximum number of reviews to return. (e.g., 40 (default) returns 40 reviews, 80 returns 80 reviews, and 100 returns 100 reviews). Maximum number of reviews you can return per search is 199. It should be used only when all_reviews parameter is set to true.",
    ).optional(),
    next_page_token: z.string().describe(
        "The next page token. It is used for retrieving the next page results. It should be used only when all_reviews parameter is set to true.",
    ).optional(),
    ...serpApiParams,
});
