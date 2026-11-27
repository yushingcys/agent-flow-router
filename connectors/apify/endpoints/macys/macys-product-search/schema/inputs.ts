import { z } from "zod";

/**
 * pintostudio/macys-product-search — actor input schema, scaffolded from the actor's PUBLISHED
 * input schema (GET /v2/acts/pintostudio~macys-product-search/builds/default →
 * actorDefinition.input) on 2026-11-27, in the
 * scripts/apify-scaffold.ts format, from the public build (no token); curated
 * by hand thereafter (re-run the script to refresh; the drift suite
 * flags divergence — deno task drift). Non-strict by policy: the actor
 * accepts supersets — unknown fields pass through.
 */
export const zMacysProductSearchBody = z.object({
    query: z.string().describe("The query to search"),
    currencyCode: z.string().describe("The currency code that will be used.")
        .optional(),
    regionCode: z.string().describe("The region code that will be used.")
        .optional(),
    page: z.string().describe("The page Index").optional(),
    perPage: z.string().describe("Limit per Page").optional(),
});
