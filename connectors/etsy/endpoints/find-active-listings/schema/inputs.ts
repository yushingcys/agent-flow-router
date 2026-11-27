import { z } from "zod";

/** `GET /v3/application/listings/active` query parameters
 *  (findAllListingsActive in Etsy's OpenAPI 3.0 document, read
 *  2026-11-27). Mirror carries optionality only (D25). */
export const zFindActiveListingsQuery = z.strictObject({
    limit: z.number().int().min(1).max(100).optional().describe(
        "The maximum number of results to return, 1-100 (default 25).",
    ),
    offset: z.number().int().min(0).optional().describe(
        "The number of records to skip before selecting the first " +
            "result (default 0).",
    ),
    keywords: z.string().min(1).optional().describe(
        "Search term or phrase that must appear in all results.",
    ),
    sort_on: z.enum(["created", "price", "updated", "score"]).optional()
        .describe(
            "The value to sort a search result on (default created). " +
                "Only works with a search option such as keywords; score " +
                "is always descending.",
        ),
    sort_order: z.enum(["asc", "ascending", "desc", "descending", "up", "down"])
        .optional().describe(
            "Ascending or descending order (default desc). Only works " +
                "with a search option such as keywords.",
        ),
    min_price: z.number().optional().describe(
        "The minimum price of listings to be returned.",
    ),
    max_price: z.number().optional().describe(
        "The maximum price of listings to be returned.",
    ),
    taxonomy_id: z.number().int().optional().describe(
        "The numerical taxonomy ID of the listing (SellerTaxonomy / " +
            "BuyerTaxonomy).",
    ),
    shop_location: z.string().min(1).optional().describe(
        "Filters by shop location. If location cannot be parsed, Etsy " +
            "responds with an error.",
    ),
    is_safe: z.boolean().optional().describe(
        "When true, filters out mature/adult content.",
    ),
    currency: z.string().length(3).optional().describe(
        "ISO 4217 code (e.g. EUR) to convert listing prices into.",
    ),
    buyer_country: z.string().length(2).optional().describe(
        "ISO 3166-1 alpha-2 code (e.g. DE); only listings that ship " +
            "there.",
    ),
});
