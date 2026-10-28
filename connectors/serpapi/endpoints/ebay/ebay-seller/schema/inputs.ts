import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `ebay_seller` engine query parameters (https://serpapi.com/ebay-seller-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zEbaySellerQuery = z.strictObject({
    seller_id: z.string().min(1).describe(
        "An ID of the seller to get results for. It can be found in the username field of our eBay Search API and eBay Product API results, or in seller links: https://www.ebay.com/usr/{seller_id}.",
    ),
    type: z.string().min(1).describe(
        "The type of the seller. The available options are user and store. You can find the seller type using our eBay Product API.",
    ),
    ebay_domain: z.string().describe(
        "The eBay domain to use. It defaults to ebay.com.",
    ).optional(),
    _pgn: z.number().describe(
        "The page number. It's used for pagination. (e.g., 1 (default) is the first page of results, 2 is the 2nd page of results, 3 is the 3rd page of results, etc.).",
    ).optional(),
    _ipg: z.number().describe(
        "The maximum number of results to return. There are three options: 24, 48 (default), and 72 results.",
    ).optional(),
    _sop: z.string().describe(
        "Results sorted by different options in the eBay. The default option is 'Best Match'. Available options: 12 - Best Match 1 - Time ending soonest 10 - Time newly listed 15 - Price + Shipping: lowest first 16 - Price + Shipping: highest first 7 - Distance: nearest first",
    ).optional(),
    buying_format: z.string().describe(
        "The buying format you can apply to the results. The default option is 'All Listings'. Available options: 0 - All Listings 1 - Buy It Now 2 - Auction",
    ).optional(),
    LH_ItemCondition: z.string().describe(
        "One or multiple product conditions to limit the search to. Condition is represented via numeric ID. There are three options: 3 for New, 4 for Used, 10 for Not Specified. Multiple IDs should be joined with | delimiter, e.g. 3|4.",
    ).optional(),
    free_shipping: z.string().describe(
        "Show only products with free shipping.",
    ).optional(),
    ...serpApiParams,
});
