import { z } from "zod";

/**
 * crw/temu-products-scraper — dataset ITEM schema, scaffolded from the actor's
 * PUBLISHED storages.dataset.fields on 2026-11-27, in the
 * scripts/apify-scaffold.ts format, from the public build (no token).
 * Passthrough DOCUMENTATION (design D29):
 * non-strict, every field optional ("required" stripped) — output
 * validation can never fail a paid run over vendor drift; the drift
 * suite reports field additions/removals informationally.
 */
export const zTemuProductsScraperOutputItem = z.object({
    goods_id: z.number().int().describe("Unique product identifier.")
        .optional(),
    title: z.string().describe("Full product name as displayed on Temu.")
        .optional(),
    price: z.number().describe(
        "Current selling price as a raw numeric value from the API.",
    ).optional(),
    price_str: z.string().describe(
        "Current selling price as a formatted string.",
    ).optional(),
    market_price: z.number().describe(
        "Original/crossed-out price as a raw numeric value from the API. 0 if not discounted.",
    ).optional(),
    market_price_str: z.string().describe(
        "Original price as a formatted string. Empty string if not discounted.",
    ).optional(),
    reduction_pct: z.number().int().describe(
        "Raw discount rate value from the API. 0 if not discounted.",
    ).optional(),
    currency: z.string().describe("Currency code for pricing fields.")
        .optional(),
    sales_num: z.string().describe("Raw number of units sold.").optional(),
    sales_tip: z.string().describe(
        "Sales display text as shown on the product listing.",
    ).optional(),
    rating: z.number().describe(
        "Average product rating on a scale of 0 to 5. 0 if no reviews.",
    ).optional(),
    review_count: z.number().int().describe(
        "Total number of customer reviews. 0 if none.",
    ).optional(),
    thumb_url: z.string().describe("Product thumbnail image URL.").optional(),
    image_url: z.string().describe("Full-size product image URL.").optional(),
    video_url: z.string().describe(
        "Product video URL. Empty string if no video.",
    ).optional(),
    link_url: z.string().describe("Full URL to the product page on Temu.")
        .optional(),
    mall_id: z.number().int().describe(
        "Unique identifier of the seller's store.",
    ).optional(),
    mall_link: z.string().describe("URL to the seller's store page on Temu.")
        .optional(),
    opt_id: z.number().int().describe("Product category/option identifier.")
        .optional(),
    adult_goods: z.boolean().describe("Whether the product is age-restricted.")
        .optional(),
});
/** Tolerant by construction: an item that drifts off the documented
 *  shape still passes as a plain object — validation can NEVER fail a
 *  paid run; the typed branch is the documentation. */
export const zTemuProductsScraperOutput = z.array(
    zTemuProductsScraperOutputItem.or(z.record(z.string(), z.unknown())),
);
