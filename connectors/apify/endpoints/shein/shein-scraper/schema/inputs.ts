import { z } from "zod";

/**
 * axlymxp/Shein-scraper — actor input schema, scaffolded from the actor's PUBLISHED
 * input schema (GET /v2/acts/axlymxp~Shein-scraper/builds/default →
 * actorDefinition.input) on 2026-11-27, in the
 * scripts/apify-scaffold.ts format, from the public build (no token); curated
 * by hand thereafter (re-run the script to refresh; the drift suite
 * flags divergence — deno task drift). Non-strict by policy: the actor
 * accepts supersets — unknown fields pass through.
 */
export const zSheinScraperBody = z.object({
    keywords: z.string().describe(
        "Search term(s) for products to scrape from Shein, or a SHEIN goods ID (digits) to look up one product",
    ),
    country: z.string().describe(
        "2-letter ISO code of the Shein storefront, e.g. US, CA, AU, NZ, MX, BR, CL, CO, SA, AE, KW, QA, IL, ZA, JP, SG, TW, TH, PH, VN, IN. Not supported (Shein demands on-device verification, HTTP 428 code 836100): the UK (GB/UK), all EU/EEA countries, Switzerland (CH), Norway (NO), Turkey (TR) and Arge...",
    ).optional(),
    currency: z.string().describe(
        "3-letter currency code, e.g. USD, CAD, AUD, MXN, BRL, SAR, JPY.",
    ).optional(),
    language: z.string().describe(
        "2-letter language code, e.g. en, es, pt, fr, ar, ja. Locale tags such as pt-br or pt_BR are accepted and reduced to the language (pt).",
    ).optional(),
    limit: z.number().int().min(1).max(100).describe(
        "Maximum number of products to scrape",
    ).optional(),
    page: z.number().int().min(1).describe("Page number to scrape").optional(),
});
