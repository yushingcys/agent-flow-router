import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `home_depot` engine query parameters (https://serpapi.com/home-depot-search-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zHomeDepotSearchQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The search query. You can use anything that you would use in a regular The Home Depot search.",
    ),
    country: z.string().describe(
        "The country to use for the Home Depot search. Only United States(us), and Canada(ca) are supported.",
    ).optional(),
    hd_sort: z.string().describe(
        "Results sorted by different options in Home Depot US. It can be set to: top_sellers: Top Sellers, price_low_to_high: Price Low to High, price_high_to_low: Price High to Low, top_rated: Top Rated, best_match: Best Match",
    ).optional(),
    hd_filter_tokens: z.string().describe(
        "Used to pass filter tokens divided by comma. Filter tokens can be obtained from API response",
    ).optional(),
    delivery_zip: z.string().describe(
        "ZIP Postal code. To filter the shipping products by a selected area.",
    ).optional(),
    store_id: z.string().describe(
        "Store ID to filter the products by the specific store only. See all Home Depot stores",
    ).optional(),
    store: z.string().describe(
        "Store ID to filter the products by the specific store only in Home Depot Canada. The default store is Gatineau (7140). See all Home Depot Canada stores",
    ).optional(),
    sort: z.string().describe(
        "Results sorted by different options in Home Depot Canada. It can be set to: price-asc: Price Low to High, price-desc: Price High to Low, reviewAvgRating: Top Rated, relevance: Recommended (Default)",
    ).optional(),
    filter: z.string().describe(
        "Used to pass filter tokens divided by dash (-) in Home Depot Canada. Filter tokens can be obtained from API response",
    ).optional(),
    lowerbound: z.string().describe(
        "Defines lower bound for price in USD.",
    ).optional(),
    upperbound: z.string().describe(
        "Defines upper bound for price in USD.",
    ).optional(),
    minmax: z.string().describe(
        "Defines lower and upper bound for price in CAD. Parameter is only used in the Home Depot Canada. Example: price:[100 TO 500](Between $100 to $500) Example: price:[100 TO *](Minimum $100) Example: price:[0 TO 500](Maximum $500) Example: price:%5B100%20TO%20500%5D(Encoded version, Between $100 to $500)",
    ).optional(),
    nao: z.number().describe(
        "Defines offset for products result. A single page contains 24 products. First page offset is 0, second -> 24, third -> 48 and so on.",
    ).optional(),
    page: z.number().describe(
        "Value is used to get the items on a specific page. (e.g., 1 (default) is the first page of results, 2 is the 2nd page of results, 3 is the 3rd page of results, etc.). This parameter is common for both US and CA searches.",
    ).optional(),
    ps: z.number().describe(
        "Determines the number of items per page. There are scenarios where The Home Depot overrides the ps value. By default, The Home Depot returns 24 (maximum allowed value) results.",
    ).optional(),
    pagesize: z.number().describe(
        "Determines the number of items per page in the Home Depot Canada. By default, the Home Depot Canada returns 40 (maximum allowed value) results.",
    ).optional(),
    ...serpApiParams,
});
