import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_immersive_product` engine query parameters (https://serpapi.com/google-immersive-product-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleImmersiveProductQuery = z.strictObject({
    page_token: z.string().min(1).describe(
        "The token needed to show more product info in Google immersive popup.",
    ),
    more_stores: z.string().describe(
        "Parameter for fetching more stores results in single search. It can be set to 1 or true. By default, a search returns 3 to 5 stores. When the more_stores parameter is enabled, up to 13 stores will be returned, or the maximum available, depending on the product.",
    ).optional(),
    next_page_token: z.string().describe(
        "The next page token. It is used for retrieving the next page of results for stores. The token is returned as stores_next_page_token from the search results.",
    ).optional(),
    ...serpApiParams,
});
