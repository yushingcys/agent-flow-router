import { z } from "zod";

/** `GET /v1/products/{sku}/stores.json` (bestbuyapis.github.io/
 *  api-documentation, "In-Store Availability", read 2026-11-27). Mirror
 *  carries optionality only (D25). */
export const zProductStoresQuery = z.strictObject({
    postalCode: z.string().min(1).optional().describe(
        "US ZIP code; lists stores near it that carry the SKU.",
    ),
    storeId: z.string().min(1).optional().describe(
        "One Best Buy store id, to check that store only.",
    ),
});
