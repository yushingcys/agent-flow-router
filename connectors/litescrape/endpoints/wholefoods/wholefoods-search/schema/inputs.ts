import { z } from "zod";
import {
    zRetailPage,
    zRetailQuery,
    zRetailTimeout,
    zStoreId,
} from "../../../../schema/common.ts";

/** GET /wholefoods/search query (https://litescrape.com/docs/wholefoods-search, read 2026-11-27).
 *  Mirror carries optionality only (D25). */
export const zWholeFoodsSearchQuery = z.object({
    query: zRetailQuery.describe(
        "Product keywords to search for.",
    ),
    page: zRetailPage.describe(
        "One-based result page. Default 1.",
    ).optional(),
    store_id: zStoreId.describe(
        "Whole Foods store id used for price and availability, such as 10233.",
    ).optional(),
    timeout: zRetailTimeout.optional(),
}).strict();
