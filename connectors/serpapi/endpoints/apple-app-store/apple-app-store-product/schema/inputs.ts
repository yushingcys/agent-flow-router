import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `apple_product` engine query parameters (https://serpapi.com/apple-product,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zAppleAppStoreProductQuery = z.strictObject({
    product_id: z.string().min(1).describe(
        "The product id you want to search. You can use the specific id of a product that you would like to get the product page of.",
    ),
    type: z.string().describe(
        "The type of Apple Product to get the product page of. It defaults to app.",
    ).optional(),
    country: z.string().describe(
        "The country to use for the search. It's a two-letter country code. (e.g., us (default) for the United States, uk for United Kingdom, or fr for France).",
    ).optional(),
    ...serpApiParams,
});
