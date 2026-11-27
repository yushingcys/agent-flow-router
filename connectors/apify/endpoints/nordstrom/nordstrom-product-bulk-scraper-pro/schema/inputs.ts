import { z } from "zod";

/**
 * hello.datawizards/nordstrom-product-bulk-scraper-pro — actor input schema, scaffolded from the actor's PUBLISHED
 * input schema (GET /v2/acts/hello.datawizards~nordstrom-product-bulk-scraper-pro/builds/default →
 * actorDefinition.input) on 2026-11-27, in the
 * scripts/apify-scaffold.ts format, from the public build (no token); curated
 * by hand thereafter (re-run the script to refresh; the drift suite
 * flags divergence — deno task drift). Non-strict by policy: the actor
 * accepts supersets — unknown fields pass through.
 */
export const zNordstromProductBulkScraperProBody = z.object({
    queries: z.array(z.any()).describe(
        "One or more queries where the crawler will start.",
    ),
    itemLimit: z.number().int().describe(
        "Specifies the maximum number of items to process.",
    ).optional(),
    proxyConfiguration: z.record(z.string(), z.any()).describe(
        "Specifies proxy servers that will be used by the scraper in order to hide its origin.",
    ).optional(),
});
