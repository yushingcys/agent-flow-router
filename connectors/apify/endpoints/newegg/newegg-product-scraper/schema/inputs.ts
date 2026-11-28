import { z } from "zod";

/**
 * kawsar/newegg-product-scraper — actor input schema, scaffolded from the
 * actor's PUBLISHED input schema
 * (GET /v2/acts/kawsar~newegg-product-scraper/builds/default →
 * actorDefinition.input) on 2026-11-27, in the
 * scripts/apify-scaffold.ts format, from the public build (no token);
 * curated by hand thereafter (re-run the script to refresh; the drift
 * suite flags divergence — deno task drift). Non-strict by policy: the
 * actor accepts supersets — unknown fields pass through.
 */
export const zNeweggProductScraperBody = z.object({
    keywords: z.array(z.any()).describe(
        'One or more search terms to query on Newegg (e.g. "RTX 4070", "AMD Ryzen 9"). Each keyword is searched separately.',
    ).optional(),
    productUrls: z.array(z.any()).describe(
        "Individual Newegg product page URLs to scrape. Use this to get full detail data including specs, seller info, and item numbers.",
    ).optional(),
    maxItems: z.number().int().min(1).max(1000).describe(
        "Maximum number of products to extract per run.",
    ).optional(),
    maxPages: z.number().int().min(1).max(50).describe(
        "Maximum number of search or category result pages to follow per input.",
    ).optional(),
    requestTimeoutSecs: z.number().int().min(5).max(120).describe(
        "Per-request timeout in seconds. Increase if you get timeout errors on slow connections.",
    ).optional(),
});
