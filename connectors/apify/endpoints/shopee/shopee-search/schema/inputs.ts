import { z } from "zod";

/**
 * xtracto/shopee-search — actor input schema, scaffolded from the actor's PUBLISHED
 * input schema (GET /v2/acts/xtracto~shopee-search/builds/default →
 * actorDefinition.input) on 2026-11-27, in the
 * scripts/apify-scaffold.ts format, from the public build (no token); curated
 * by hand thereafter (re-run the script to refresh; the drift suite
 * flags divergence — deno task drift). Non-strict by policy: the actor
 * accepts supersets — unknown fields pass through.
 */
export const zShopeeSearchBody = z.object({
    country: z.enum([
        "id",
        "sg",
        "my",
        "th",
        "ph",
        "vn",
        "br",
        "tw",
        "mx",
        "co",
        "cl",
    ]).describe(
        "Shopee regional site. Notes: (1) mode=category is NOT available for Colombia (co) and Chile (cl) — these regions do not expose category pages publicly; the actor will stop early with a clear message. (2) fetchDetail=true returns full product data (description, brand, all variants, attributes, ima...",
    ).optional(),
    mode: z.enum(["keyword", "category", "url"]).describe(
        "How to search for products.",
    ),
    keyword: z.string().describe(
        "Search keyword. Required for mode=keyword. Example: 'laptop gaming'",
    ).optional(),
    category: z.string().describe(
        "Category slug or full URL. Required for mode=category. Example: /Laptop-cat.11044364.11044440",
    ).optional(),
    url: z.string().describe(
        "Any Shopee search/category URL. Required for mode=url. Country is auto-detected. Example: https://shopee.co.id/search?keyword=laptop",
    ).optional(),
    sort: z.enum(["relevancy", "sales", "newest", "price_asc", "price_desc"])
        .describe("Sort order for search results.").optional(),
    maxProducts: z.number().int().min(1).max(500).describe(
        "Maximum number of products to return.",
    ).optional(),
    minPrice: z.number().int().describe(
        "Minimum price in local currency. Only for mode=keyword.",
    ).optional(),
    maxPrice: z.number().int().describe(
        "Maximum price in local currency. Only for mode=keyword.",
    ).optional(),
    fetchDetail: z.boolean().describe(
        "If enabled, each product card is enriched with full detail: description, brand, all variants, attributes, image gallery, seller info, and more. Uses more requests and takes longer — recommended for small batches (≤20 products). Detail richness varies by country (see the country field for details).",
    ).optional(),
    delay: z.number().describe("Delay between HTTP requests.").optional(),
});
