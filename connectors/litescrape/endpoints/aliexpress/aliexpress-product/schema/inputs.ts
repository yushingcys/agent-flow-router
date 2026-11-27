import { z } from "zod";
import { zProductUrl, zRetailTimeout } from "../../../../schema/common.ts";

/** GET /aliexpress/product query (https://litescrape.com/docs/aliexpress-product, read 2026-11-27).
 *  Mirror carries optionality only (D25). */
export const zAliExpressProductQuery = z.object({
    url: zProductUrl.describe(
        "AliExpress product page URL.",
    ),
    timeout: zRetailTimeout.optional(),
}).strict();
