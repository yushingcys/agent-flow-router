import { z } from "zod";

/**
 * e-commerce/costco-fast-product-scraper — actor input schema, scaffolded
 * from the actor's PUBLISHED input schema
 * (GET /v2/acts/e-commerce~costco-fast-product-scraper/builds/default →
 * actorDefinition.input) on 2026-11-27, in the
 * scripts/apify-scaffold.ts format, from the public build (no token);
 * curated by hand thereafter (re-run the script to refresh; the drift
 * suite flags divergence — deno task drift). Non-strict by policy: the
 * actor accepts supersets — unknown fields pass through.
 */
export const zCostcoFastProductScraperBody = z.object({
    startUrls: z.array(z.any()).describe(
        "One or more Costco.com product or category page URLs to scrape.",
    ).optional(),
    keyword: z.string().describe(
        "A search term to find products, used instead of or alongside the URLs.",
    ).optional(),
    maxProductsPerUrl: z.number().int().min(1).describe(
        "The maximum number of products to scrape from each category or search URL, for example 30.",
    ).optional(),
});
