import { z } from "zod";

/** `GET /v1/products/{sku}.json` (bestbuyapis.github.io/api-documentation,
 *  "Products API", read 2026-11-27). Mirror carries optionality only (D25). */
export const zSkuPathParams = z.strictObject({
    sku: z.string().regex(/^[0-9]+$/).describe(
        "Best Buy SKU, digits only, e.g. 6418599.",
    ),
});

export const zGetProductQuery = z.strictObject({
    show: z.string().min(1).optional().describe(
        "Comma-separated attributes to return, e.g. " +
            "sku,name,regularPrice,salePrice,onSale,onlineAvailability," +
            "inStoreAvailability,orderable,url. Default: all.",
    ),
});
