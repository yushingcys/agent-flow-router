import { z } from "zod";
import {
    zProductUrl,
    zRetailTimeout,
    zStoreId,
} from "../../../../schema/common.ts";

/** GET /ikea/product query (https://litescrape.com/docs/ikea-product, read 2026-11-27).
 *  Mirror carries optionality only (D25). */
export const zIkeaProductQuery = z.object({
    url: zProductUrl.describe(
        "IKEA product page URL.",
    ),
    store_id: zStoreId.describe(
        "IKEA store id used for price and availability, such as 170.",
    ).optional(),
    timeout: zRetailTimeout.optional(),
}).strict();
