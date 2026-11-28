import { z } from "zod";
import { zProductUrl, zRetailTimeout } from "../../../../schema/common.ts";

/** GET /wayfair/product query (https://litescrape.com/docs/wayfair-product, read 2026-11-27).
 *  Mirror carries optionality only (D25). */
export const zWayfairProductQuery = z.object({
    url: zProductUrl.describe(
        "Wayfair product page URL.",
    ),
    timeout: zRetailTimeout.optional(),
}).strict();
