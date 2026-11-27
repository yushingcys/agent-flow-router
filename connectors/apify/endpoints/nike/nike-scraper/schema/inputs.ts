import { z } from "zod";

/**
 * fatihtahta/nike-scraper — actor input schema, scaffolded from the actor's PUBLISHED
 * input schema (GET /v2/acts/fatihtahta~nike-scraper/builds/default →
 * actorDefinition.input) on 2026-11-27, in the
 * scripts/apify-scaffold.ts format, from the public build (no token); curated
 * by hand thereafter (re-run the script to refresh; the drift suite
 * flags divergence — deno task drift). Non-strict by policy: the actor
 * accepts supersets — unknown fields pass through.
 */
export const zNikeScraperBody = z.object({
    startUrls: z.array(z.any()).describe(
        "Paste one or more Nike search, category, or individual product page URLs to scrape.",
    ).optional(),
    queries: z.array(z.any()).describe(
        "Paste one or more Nike search queries to scrape.",
    ).optional(),
    limit: z.number().int().min(10).describe(
        "Stop the run after this number of listings has been saved per input.",
    ).optional(),
    proxyConfiguration: z.record(z.string(), z.any()).describe(
        "The default Apify Residential proxy keeps the scraper reliable.",
    ).optional(),
});
