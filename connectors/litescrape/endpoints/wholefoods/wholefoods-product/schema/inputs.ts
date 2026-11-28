import { z } from "zod";
import {
    zProductUrl,
    zRetailTimeout,
    zStoreId,
} from "../../../../schema/common.ts";

/** GET /wholefoods/product query (https://litescrape.com/docs/wholefoods-product, read 2026-11-27).
 *  Mirror carries optionality only (D25). */
export const zWholeFoodsProductQuery = z.object({
    url: zProductUrl.describe(
        "Whole Foods product page URL.",
    ),
    store_id: zStoreId.describe(
        "Whole Foods store id used for price and availability, such as 10233.",
    ).optional(),
    timeout: zRetailTimeout.optional(),
}).strict();
