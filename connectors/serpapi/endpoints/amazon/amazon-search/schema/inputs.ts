import { z } from "zod";
import { serpApiParams, zDevice } from "../../../../schema/common.ts";

/** `amazon` engine query parameters (https://serpapi.com/amazon-search-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zAmazonSearchQuery = z.strictObject({
    k: z.string().describe(
        "The query you want to search. You can use anything that you would use in a regular Amazon search. This parameter can't be used with the node parameter.",
    ).optional(),
    amazon_domain: z.string().describe(
        "The Amazon domain to use. It defaults to amazon.com. Head to Amazon domains for a full list of supported Amazon domains.",
    ).optional(),
    language: z.string().describe(
        "The language to use for the Amazon search. It's a locale name represented as <language>_<REGION>. (e.g., on amazon.com en_US for English, es_US for Spanish, or on amazon.co.jp ja_JP for Japanese). Head to Amazon languages for a full list of supported Amazon languages.",
    ).optional(),
    delivery_zip: z.string().describe(
        "ZIP Postal code. To filter the shipping products by a selected area.",
    ).optional(),
    shipping_location: z.string().describe(
        "Shipping country. To filter the shipping products by a selected country.",
    ).optional(),
    s: z.string().describe(
        "Sorting results. Available options: relevanceblender - Featured (default) price-asc-rank - Price: Low to High price-desc-rank - Price: High to Low review-rank - Avg. Customer Review date-desc-rank - Newest Arrivals exact-aware-popularity-rank - Best Sellers",
    ).optional(),
    node: z.string().describe(
        "Parameter specifies the category for Amazon search results. You can find the appropriate node value by browsing Amazon’s website and accessing a specific category. The node ID is typically included in the URL after the format node=[NODE ID]. For example, on Amazon.com, the node for Smart Home is 6563140011, and on Amazon.co.uk, the node for Fashion is 11961407031.",
    ).optional(),
    rh: z.string().describe(
        "Items filtering based on their attributes. The structure is a list of key:value pairs separated by ,. For example n:16318031,p_n_cpf_eligible:21512497011,p_72:1248897011 to filter for products in Coffee department (n:16318031) that are Climate Pledge Friendly (p_n_cpf_eligible:21512497011) and rated 4 Stars & Up (p_72:1248897011). Head to Amazon Category Nodes for a full list of supported Amazon Categories.",
    ).optional(),
    dc: z.boolean().describe(
        "The exclusion of results from an auto-corrected query when the original query is spelled wrong. It can be set to true to exclude these results, or false to include them (default).",
    ).optional(),
    page: z.number().describe(
        "The page number. It's used for pagination. (e.g., 1 (default) is the first page of results, 2 is the 2nd page of results, 3 is the 3rd page of results, etc.).",
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
