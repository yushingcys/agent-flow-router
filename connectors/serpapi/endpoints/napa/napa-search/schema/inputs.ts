import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `napa` engine query parameters (https://serpapi.com/napa-search-api, read 2026-11-27).
 *  Mirror carries optionality only (D25). */
export const zNapaSearchQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The search query. You can use anything that you would use in a regular NAPA Auto Parts search: a part name, a brand, or a part number, including part numbers of other brands that NAPA products replace (e.g., brake cleaner, Brakleen, CRC 05050, or PH3614).",
    ),
    store_id: z.string().describe(
        "NAPA store whose prices, promotions, and availability to use. It is the number at the end of the store page URL on napaonline.com (e.g., 22706). It defaults to 28693, a store in Chicago, IL.",
    ).optional(),
    sort: z.string().describe(
        "Sorting. It defaults to relevance. Available options: relevance, price_low_to_high, price_high_to_low, product_description, line_abbreviation, part_number.",
    ).optional(),
    page: z.number().describe(
        "Page of results. 1 (default) is the first page. NAPA returns up to 12 results per page.",
    ).optional(),
    ...serpApiParams,
});
