import { z } from "zod";

/**
 * hello.datawizards/nordstrom-product-bulk-scraper-pro — dataset ITEM schema, scaffolded from the actor's
 * PUBLISHED storages.dataset.fields on 2026-11-27, in the
 * scripts/apify-scaffold.ts format, from the public build (no token).
 * Passthrough DOCUMENTATION (design D29):
 * non-strict, every field optional ("required" stripped) — output
 * validation can never fail a paid run over vendor drift; the drift
 * suite reports field additions/removals informationally.
 */
export const zNordstromProductBulkScraperProOutputItem = z.object({
    query: z.any().describe(
        "Search query keyword used to retrieve the product listing.",
    ).optional(),
    product_id: z.any().describe(
        "Unique numeric identifier of the product on Nordstrom.",
    ).optional(),
    style_group: z.any().describe(
        "Style group identifier associated with the product.",
    ).optional(),
    path_alias: z.any().describe(
        "SEO-friendly path alias used in the product URL.",
    ).optional(),
    name: z.any().describe("Official product name as listed on Nordstrom.")
        .optional(),
    brand: z.any().describe("Brand name of the product.").optional(),
    average_rating: z.any().describe("Average customer rating for the product.")
        .optional(),
    review_count: z.any().describe(
        "Total number of customer reviews for the product.",
    ).optional(),
    colors: z.any().describe("Comma-separated list of available color options.")
        .optional(),
    price: z.any().describe("Current selling price of the product.").optional(),
    currency: z.any().describe(
        "Currency code used for the product price (e.g., USD).",
    ).optional(),
    inventory_quantity: z.any().describe(
        "Total available inventory quantity for the product.",
    ).optional(),
    store_availability_count: z.any().describe(
        "Number of physical stores where the product is available.",
    ).optional(),
    front_image_url: z.any().describe(
        "URL of the primary product image or N/A if unavailable.",
    ).optional(),
    marketing_attributes: z.any().describe(
        "Additional marketing or merchandising attributes associated with the product.",
    ).optional(),
});
/** Tolerant by construction: an item that drifts off the documented
 *  shape still passes as a plain object — validation can NEVER fail a
 *  paid run; the typed branch is the documentation. */
export const zNordstromProductBulkScraperProOutput = z.array(
    zNordstromProductBulkScraperProOutputItem.or(
        z.record(z.string(), z.unknown()),
    ),
);
