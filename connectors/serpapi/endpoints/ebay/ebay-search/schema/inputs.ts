import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `ebay` engine query parameters (https://serpapi.com/ebay-search-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zEbaySearchQuery = z.strictObject({
    _nkw: z.string().min(1).describe(
        "The search query. You can use anything that you would use in a regular eBay search. _nkw parameter is optional when category_id parameter is specified.",
    ),
    ebay_domain: z.string().describe(
        "The eBay domain to use. It defaults to ebay.com.",
    ).optional(),
    _salic: z.string().describe(
        "The location based on country.",
    ).optional(),
    _pgn: z.number().describe(
        "The page number. It's used for pagination. (e.g., 1 (default) is the first page of results, 2 is the 2nd page of results, 3 is the 3rd page of results, etc.).",
    ).optional(),
    _ipg: z.number().describe(
        "The maximum number of results to return. There are three options: 60 (default), 120 and 240 results.",
    ).optional(),
    _blrs: z.string().describe(
        "The exclusion of results from an auto-corrected query when the original query is spelled wrong. The recommended value for this parameter is spell_auto_correct. Omit _blrs if you want the search to include results for an auto-corrected query. Note that this parameter may not prevent eBay from returning results for an auto-corrected query if no other results are available.",
    ).optional(),
    show_only: z.string().describe(
        "The list of filters you can apply to the results.",
    ).optional(),
    buying_format: z.string().describe(
        "The buying format you can apply to the results. Available options (case-sensitive): Auction - Auction BIN - Buy It Now BO - Accepts Offers",
    ).optional(),
    _sasl: z.string().describe(
        "The seller username(s) to filter results by. You can specify multiple sellers separated by commas (e.g. iRobot,samsung). Use with _saslop to control whether to include or exclude items from the specified seller(s).",
    ).optional(),
    _saslop: z.string().describe(
        "Whether to include or exclude items from the seller(s) specified in _sasl. Available options: 1 - Only show items from sellers (default) 2 - Don't show items from sellers",
    ).optional(),
    popular_filters: z.string().describe(
        "Parameter allows filtering items based on their attributes. The structure is a list of key=value pairs separated by & (e.g. Brand=Nespresso&Size=L). To pass multiple values for the same filter, join them with | (e.g. Brand=adidas|Majestic). Values can be obtained from the popular_filters[].parameter field of the API response.",
    ).optional(),
    _udlo: z.string().describe(
        "The lowest price of items that should be included in the results (e.g. 10 will only return items that have higher price than 10).",
    ).optional(),
    _udhi: z.string().describe(
        "The highest price of items that should be included in the results (e.g. 20 will only return items that have lower price than 20).",
    ).optional(),
    _sop: z.string().describe(
        "Results sorted by different options in the eBay. The default option is 'Best Match'.",
    ).optional(),
    _dmd: z.string().describe(
        "The visual layout for displaying results. The available options are 'Grid' and 'List'.",
    ).optional(),
    category_id: z.string().describe(
        "The ID of a category where you want your search to be concentrated. ID values are accessible inside categories array, located in our JSON output (e.g. categories[1].id). You can search using category_id parameter without specifying _nkw parameter.",
    ).optional(),
    _stpos: z.string().describe(
        "The ZIP or Postal code. You can use it to filter the shipping products by a selected area.",
    ).optional(),
    LH_ItemCondition: z.string().describe(
        "One or multiple product conditions to limit the search to. Condition is represented via numeric ID, e.g. 1000 for New. Multiple IDs should be joined with | delimiter, e.g. 1000|3000. List of supported IDs can be found on eBay documentation page. There is also undocumented ID 10 for Not Specified condition.",
    ).optional(),
    LH_PrefLoc: z.string().describe(
        "The preferred location. The available options are 'Domestic', 'Regional', and 'Worldwide'.",
    ).optional(),
    ...serpApiParams,
});
