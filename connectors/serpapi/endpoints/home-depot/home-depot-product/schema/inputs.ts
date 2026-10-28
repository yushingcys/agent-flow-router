import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `home_depot_product` engine query parameters (https://serpapi.com/home-depot-product,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zHomeDepotProductQuery = z.strictObject({
    product_id: z.string().min(1).describe(
        "The Home Depot identifier of a product. Only Product IDs gathered from the Home Depot US are supported.",
    ),
    delivery_zip: z.string().describe(
        "ZIP Postal code. To filter the shipping products by a selected area.",
    ).optional(),
    store_id: z.string().describe(
        "Store ID to filter the products by the specific store only.",
    ).optional(),
    ...serpApiParams,
});
