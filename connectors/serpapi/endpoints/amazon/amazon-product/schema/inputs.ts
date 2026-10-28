import { z } from "zod";
import { serpApiParams, zDevice } from "../../../../schema/common.ts";

/** `amazon_product` engine query parameters (https://serpapi.com/amazon-product-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zAmazonProductQuery = z.strictObject({
    asin: z.string().min(1).describe(
        "The Amazon Standard Identification Number (ASIN) of the product you want to retrieve. This is a unique identifier assigned to each product on Amazon.",
    ),
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
    other_sellers: z.string().describe(
        "Include results from other sellers.",
    ).optional(),
    all_related_products: z.boolean().describe(
        "Set to true to retrieve all items in related_products and related_product_sections, not just the first page. May yield better results but with a longer response time. Defaults to false.",
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
