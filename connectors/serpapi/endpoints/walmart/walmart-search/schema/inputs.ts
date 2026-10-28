import { z } from "zod";
import { serpApiParams, zDevice } from "../../../../schema/common.ts";

/** `walmart` engine query parameters (https://serpapi.com/walmart-search-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zWalmartSearchQuery = z.strictObject({
    query: z.string().describe(
        "The search query. You can use anything that you would use in a regular Walmart search. Either a query or a cat_id parameter is required.",
    ).optional(),
    walmart_domain: z.string().describe(
        "The Walmart domain to use. It defaults to walmart.com.",
    ).optional(),
    sort: z.string().describe(
        "Sorting. (e.g. price_low, price_high, best_seller, best_match, rating_high, new). Note: best_seller, rating_high, and new are not supported for walmart.com.mx.",
    ).optional(),
    soft_sort: z.string().describe(
        "Parameter enables sort by relevance. Walmart is by default showing results sorted by relevance and using the sort option. Set to false to disable sort by Relevance. Note: not supported for walmart.com.mx.",
    ).optional(),
    cat_id: z.string().describe(
        "Category on Walmart Search. (e.g. 0 (default) is all departments, 976759_976787 is 'Cookies', etc.). Either a query or a cat_id parameter is required. Note: not supported for walmart.com.mx.",
    ).optional(),
    facet: z.string().describe(
        "Items filtering based on their attributes. The structure is a list of key:value pairs separated by ||. The key and value are separated by :",
    ).optional(),
    store_id: z.string().describe(
        "Store ID to filter the products by the specific store only. It's possible for the product pricing to differ between stores.",
    ).optional(),
    min_price: z.number().describe(
        "Lower bound of price range query.",
    ).optional(),
    max_price: z.number().describe(
        "Upper bound of price range query.",
    ).optional(),
    spelling: z.boolean().describe(
        "Activate spelling fix. true (default) includes spelling fix, false searches without spelling fix.",
    ).optional(),
    nd_en: z.boolean().describe(
        "Show results with NextDay delivery only. Set to true to enable or false (default) to disable. Note: not supported for walmart.com.mx.",
    ).optional(),
    page: z.number().describe(
        "Value is used to get the items on a specific page. (e.g., 1 (default) is the first page of results, 2 is the 2nd page of results, 3 is the 3rd page of results, etc.). Maximum page value is 100.",
    ).optional(),
    device: zDevice.optional(),
    include_filters: z.boolean().describe(
        "Include filters to the JSON response. Set to true to enable or false to disable (default).",
    ).optional(),
    ...serpApiParams,
});
