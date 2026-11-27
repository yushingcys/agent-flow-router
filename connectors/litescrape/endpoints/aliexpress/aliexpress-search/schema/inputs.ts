import { z } from "zod";
import {
    zRetailPage,
    zRetailQuery,
    zRetailTimeout,
} from "../../../../schema/common.ts";

/** GET /aliexpress/search query (https://litescrape.com/docs/aliexpress-search, read 2026-11-27).
 *  Mirror carries optionality only (D25). */
export const zAliExpressSearchQuery = z.object({
    query: zRetailQuery.describe(
        "Product keywords to search for.",
    ),
    page: zRetailPage.describe(
        "One-based result page. Default 1.",
    ).optional(),
    timeout: zRetailTimeout.optional(),
}).strict();
