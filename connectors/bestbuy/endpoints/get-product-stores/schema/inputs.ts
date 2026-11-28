import { z } from "zod";

/** `GET /v1/products/{sku}/stores.json` (bestbuyapis.github.io/
 *  api-documentation, "In-Store Availability", read 2026-11-27). The
 *  documented call names a location; postalCode is the one documented. */
export const zProductStoresQuery = z.strictObject({
    postalCode: z.string().min(1).describe(
        "US ZIP code; lists stores near it that carry the SKU.",
    ),
});
