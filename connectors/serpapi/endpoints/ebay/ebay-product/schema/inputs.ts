import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `ebay_product` engine query parameters (https://serpapi.com/ebay-product-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zEbayProductQuery = z.strictObject({
    product_id: z.string().min(1).describe(
        "An ID of the product to get results for. Normally, it can be found in product link from search results: https://www.ebay.com/itm/{product_id}",
    ),
    ebay_domain: z.string().describe(
        "The eBay domain to use. It defaults to ebay.com.",
    ).optional(),
    locale: z.string().describe(
        "From where you want the search to originate from.",
    ).optional(),
    lang: z.string().describe(
        "The language to use for the search. Normally, it defaults to en-US, but some locales use localized interface (Japan, Argentina etc.) so override might be helpful. This parameter available only for United States eBay domain and only when locale is set.",
    ).optional(),
    shipping_country: z.string().describe(
        "The shipping country to use for shipping data calculation.",
    ).optional(),
    ...serpApiParams,
});
