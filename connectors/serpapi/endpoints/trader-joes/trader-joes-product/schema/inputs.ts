import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `trader_joes_product` engine query parameters (https://serpapi.com/trader-joes-product-api, read 2026-11-27).
 *  Mirror carries optionality only (D25). */
export const zTraderJoesProductQuery = z.strictObject({
    product_id: z.string().min(1).describe(
        "Trader Joe's product to get. It is the number at the end of the product page URL (e.g., 080794 in https://www.traderjoes.com/home/products/pdp/cold-brew-coffee-black-080794).",
    ),
    store_id: z.string().describe(
        "Trader Joe's store to check availability in (e.g., 454). When the product isn't sold in the store, available is false and the price is not returned.",
    ).optional(),
    ...serpApiParams,
});
