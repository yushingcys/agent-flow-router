import { z } from "zod";
import {
    zRetailPage,
    zRetailQuery,
    zRetailTimeout,
    zStoreId,
} from "../../../../schema/common.ts";

/** GET /ikea/search query (https://litescrape.com/docs/ikea-search, read 2026-11-27).
 *  Mirror carries optionality only (D25). */
export const zIkeaSearchQuery = z.object({
    query: zRetailQuery.describe(
        "Product keywords to search for.",
    ),
    page: zRetailPage.describe(
        "One-based result page. Default 1.",
    ).optional(),
    store_id: zStoreId.describe(
        "IKEA store id used for price and availability, such as 170. Omit to use the source default.",
    ).optional(),
    timeout: zRetailTimeout.optional(),
}).strict();
