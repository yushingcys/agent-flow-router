import { z } from "zod";

/**
 * moving_beacon-owner1/adidas-product-scraper — actor input schema, scaffolded from the actor's PUBLISHED
 * input schema (GET /v2/acts/moving_beacon-owner1~adidas-product-scraper/builds/default →
 * actorDefinition.input) on 2026-11-27, in the
 * scripts/apify-scaffold.ts format, from the public build (no token); curated
 * by hand thereafter (re-run the script to refresh; the drift suite
 * flags divergence — deno task drift). Non-strict by policy: the actor
 * accepts supersets — unknown fields pass through.
 */
export const zAdidasProductScraperBody = z.object({
    query: z.string().describe(
        "Keyword to search the Adidas catalog (e.g. 'ultraboost', 'samba og', 'gazelle').",
    ),
    sitePath: z.enum([
        "us",
        "uk",
        "de",
        "fr",
        "ca",
        "au",
        "jp",
        "es",
        "it",
        "nl",
    ]).describe(
        "Region-specific catalog. Each region has its own pricing/currency/availability.",
    ).optional(),
    minPrice: z.number().int().min(0).describe(
        "Only return products at or above this price. In the region's currency. Leave blank for no floor.",
    ).optional(),
    maxPrice: z.number().int().min(0).describe(
        "Only return products at or below this price. In the region's currency. Leave blank for no cap.",
    ).optional(),
    sortBy: z.enum(["relevance", "price_asc", "price_desc", "rating_desc"])
        .describe(
            "How to order the stored results (applied in-memory across all fetched pages).",
        ).optional(),
    maxResults: z.number().int().min(1).max(500).describe(
        "Cap on stored products (1–500). Multiple pages will be fetched as needed.",
    ).optional(),
    impersonate: z.enum([
        "chrome120",
        "chrome119",
        "chrome116",
        "chrome110",
        "edge101",
        "edge99",
        "safari17_0",
        "safari15_5",
    ]).describe(
        "curl_cffi impersonation target. Chrome 120 is the safest default; try edge101 or safari17_0 if you start seeing blocks.",
    ).optional(),
    proxyConfiguration: z.record(z.string(), z.any()).describe(
        "Adidas is Akamai-protected and geo-restricts pricing. Apify Residential proxies in the target region are strongly recommended.",
    ).optional(),
});
