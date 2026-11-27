import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `trader_joes` engine query parameters (https://serpapi.com/trader-joes-search-api, read 2026-11-27).
 *  Mirror carries optionality only (D25). */
export const zTraderJoesSearchQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The search query. You can use anything that you would use in a regular Trader Joe's search.",
    ),
    store_id: z.string().describe(
        "Trader Joe's store to search in, so only products sold in this store are returned (e.g., 454 for Austin - Northwest). When it isn't set, or when no store has this ID, products sold in any store are returned.",
    ).optional(),
    category_id: z.string().describe(
        "Category of the products (e.g., 194 for Coffee & Tea).",
    ).optional(),
    characteristics: z.string().describe(
        "Characteristics the products must all have, as a comma-separated list (e.g., organic,vegan). Available options: kosher, organic, gluten_free, vegan, antibiotic_free, dairy_free, grass_fed, vegetarian, fair_trade.",
    ).optional(),
    tags: z.string().describe(
        "Fun tags the products must all have, as a comma-separated list (e.g., date_night,cheese_board).",
    ).optional(),
    new_products: z.boolean().describe(
        "Only show products Trader Joe's marks as new. true or false (default).",
    ).optional(),
    sort_by: z.string().describe(
        "Sorting. It defaults to relevance. Available options: price_low_to_high, price_high_to_low, popularity.",
    ).optional(),
    page: z.number().describe(
        "Page of results. 1 (default) is the first page. Trader Joe's returns up to 15 results per page.",
    ).optional(),
    ...serpApiParams,
});
