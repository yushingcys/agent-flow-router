import { z } from "zod";
import {
    serpApiParams,
    zDevice,
    zGoogleDomain,
    zLocation,
    zUule,
} from "../../../../schema/common.ts";

/** `google_shopping_light` engine query parameters (https://serpapi.com/google-shopping-light-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleShoppingLightQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The query you want to search. You can use anything that you would use in a regular Google Shopping search.",
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
        "The parameter defines the token that includes metadata about query and search filter(s). Providing q parameter alongside the shoprs is not required. To apply multiple filters join them with || separator, e.g. shoprs_1||shoprs_2||shoprs_3. Values for this parameter are not available through the Google Shopping Light API.",
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
        "The result offset. It skips the given number of results. It's used for pagination. (e.g., 0 (default) is the first page of results, 10 is the 2nd page of results, 20 is the 3rd page of results, etc.).",
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
