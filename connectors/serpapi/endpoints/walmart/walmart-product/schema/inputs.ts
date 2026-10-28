import { z } from "zod";
import { serpApiParams, zDevice } from "../../../../schema/common.ts";

/** `walmart_product` engine query parameters (https://serpapi.com/walmart-product-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zWalmartProductQuery = z.strictObject({
    product_id: z.string().min(1).describe(
        "The product to get results for. Normally found from shopping results for supported products (e.g., https://www.walmart.com/ip/{product_id}). You can pass product_id and us_item_id. Responses from Walmart.com are faster when product_id is used.",
    ),
    store_id: z.string().describe(
        "Store ID to filter the products by the specific store only. It's possible for the product pricing to differ between stores.",
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
