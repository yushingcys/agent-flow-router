import { z } from "zod";

/**
 * crw/temu-products-scraper — actor input schema, scaffolded from the actor's PUBLISHED
 * input schema (GET /v2/acts/crw~temu-products-scraper/builds/default →
 * actorDefinition.input) on 2026-11-27, in the
 * scripts/apify-scaffold.ts format, from the public build (no token); curated
 * by hand thereafter (re-run the script to refresh; the drift suite
 * flags divergence — deno task drift). Non-strict by policy: the actor
 * accepts supersets — unknown fields pass through.
 */
export const zTemuProductsScraperBody = z.object({
    keyword: z.string().describe(
        'The keyword to search for on Temu (e.g. "wireless earbuds", "phone case"). Must contain at least one non-numeric character. Numeric-only values such as product IDs are not supported.',
    ),
    region: z.enum(["US"]).describe(
        "Target region code. Currently only US is supported.",
    ).optional(),
    sort: z.enum([
        "relevance",
        "top_sales",
        "most_recent",
        "price_low_to_high",
        "price_high_to_low",
    ]).describe("Controls the order in which search results are returned.")
        .optional(),
    max_items: z.number().int().min(10).max(100).describe(
        "Maximum number of products to collect. Cannot exceed 100.",
    ).optional(),
});
