import { z } from "zod";
import {
    serpApiParams,
    zDevice,
    zGoogleDomain,
    zLocation,
    zUule,
} from "../../../../schema/common.ts";

/** `google_shopping` engine query parameters (https://serpapi.com/google-shopping-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleShoppingQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The query you want to search. You can use anything that you would use in a regular Google Shopping search. This parameter is optional if using shoprs parameter.",
    ),
    location: zLocation.optional(),
    uule: zUule.optional(),
    google_domain: zGoogleDomain.optional(),
    gl: z.string().describe(
        "The country to use for the Google search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France)",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google Shopping search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    shoprs: z.string().describe(
        "The parameter defines the token that includes metadata about query and search filter(s). Providing q parameter alongside the shoprs is not required. To apply multiple filters join them with || separator, e.g. shoprs_1||shoprs_2||shoprs_3.",
    ).optional(),
    min_price: z.number().describe(
        "Lower bound of price range query. This parameter overrides corresponding filter embedded into shoprs parameter.",
    ).optional(),
    max_price: z.number().describe(
        "Upper bound of price range query. This parameter overrides corresponding filter embedded into shoprs parameter.",
    ).optional(),
    sort_by: z.string().describe(
        "The sorting order of the results. Available options: 1 - Price: low to high 2 - Price: high to low This parameter overrides corresponding filter embedded into shoprs parameter.",
    ).optional(),
    free_shipping: z.string().describe(
        "Show only products with free shipping. This parameter overrides corresponding filter embedded into shoprs parameter.",
    ).optional(),
    on_sale: z.string().describe(
        "Show only products that are on sale. This parameter overrides corresponding filter embedded into shoprs parameter.",
    ).optional(),
    small_business: z.string().describe(
        "Show only products from small business. This parameter overrides corresponding filter embedded into shoprs parameter.",
    ).optional(),
    safe: z.string().describe(
        "The level of filtering for adult content. It can be set to active or off, by default Google will omit explicit content.",
    ).optional(),
    start: z.number().describe(
        "Parameter is intended to define the result offset for pagination. Google Shopping's current layout does not support offset pagination: the start parameter is ignored and every request returns the first page of results (around 40 items). The num parameter is still accepted and forwarded to Google, but the current layout returns a fixed page size, so it does not change the number of results returned.",
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
