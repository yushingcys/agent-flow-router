import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `target` engine query parameters (https://serpapi.com/target-search-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zTargetSearchQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The query you want to search. You can use anything that you would use in a regular Target search (e.g., coffee, 65 inch tv, or lego star wars).",
    ),
    store_id: z.string().describe(
        "The Target store to get prices and availability for, like the store selected on Target (e.g., 1375 for Mpls Nicollet Mall, MN). The store ID is the number at the end of the store's page URL on Target (e.g., https://www.target.com/sl/mpls-nicollet-mall/1375). It defaults to 1771 (Cedar Rapids South, IA), the store Target uses when it can't locate the visitor.",
    ).optional(),
    delivery_zip: z.string().describe(
        "The US ZIP code to deliver to (e.g., 10001). It's used for the shipping dates and the same day delivery availability. It defaults to the location of the store.",
    ).optional(),
    sort: z.string().describe(
        "The sorting of the results. It defaults to relevance. Available options: relevance - Relevance featured - Featured price_low - Price: low to high price_high - Price: high to low rating_high - Guest rating best_seller - Bestselling newest - Newest Target only shows sponsored products when results are sorted by relevance.",
    ).optional(),
    facet: z.string().describe(
        "The filters to apply, like Target's filters (e.g., deals, brands, sizes, colors, or guest ratings). It's a comma-separated list of filter IDs (e.g., 5tdv0,4yagy for Sale and Dark Roast). Filter IDs are available in filters[].options[].id of the results when include_filters is set to true.",
    ).optional(),
    category_id: z.string().describe(
        "The category to search in (e.g., hz89j for Kitchen & Dining). Category IDs are available in the Category filter of the results when include_filters is set to true.",
    ).optional(),
    min_price: z.number().describe(
        "The minimum price of the products, in US dollars (e.g., 10).",
    ).optional(),
    max_price: z.number().describe(
        "The maximum price of the products, in US dollars (e.g., 50).",
    ).optional(),
    spelling: z.boolean().describe(
        "Whether to fix the spelling of misspelled queries, like Target. It can be set to true (default) to search for the spelling fix (e.g., coffee for cofee), as shown in search_information.spelling_fix, or false to search for the query as typed, like Target's Search instead for link.",
    ).optional(),
    page: z.number().describe(
        "Value is used to get results on a specific page. (e.g., 1 (default) is the first page of results, 2 is the 2nd page of results, 3 is the 3rd page of results, etc.). Target returns up to 24 results per page, plus sponsored products, and up to 50 pages.",
    ).optional(),
    include_filters: z.boolean().describe(
        "Whether to include the filters of the search in the JSON response, with the IDs to use in facet and category_id. It can be set to true or false (default).",
    ).optional(),
    ...serpApiParams,
});
