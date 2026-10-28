import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_product` engine query parameters (https://serpapi.com/google-product-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleProductQuery = z.strictObject({
    product_id: z.string().describe(
        "The Google product to get results for. It is the product_id returned by the Google Shopping API (also visible in product_link as prds=catalogid:{product_id}). Either product_id or page_token is required.",
    ).optional(),
    page_token: z.string().describe(
        "The token of a specific product offer, returned as immersive_product_page_token by the Google Shopping API and as page_token by this API. It selects the exact offer, variant and reviews set, and is the same token accepted by the Google Immersive Product API. Either product_id or page_token is required.",
    ).optional(),
    offer_view: z.string().describe(
        "Parameter for fetching the offer view of a product_id search in a single search. It can be set to 1 or true. By default, a product_id search returns the product page without rating, reviews, ratings, user_reviews, top_insights and variants. Ignored for page_token searches, which always return the offer view.",
    ).optional(),
    gl: z.string().describe(
        "The country to use for the Google Product search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France). Defaults to us.",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google Product search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French). Defaults to en.",
    ).optional(),
    ...serpApiParams,
});
