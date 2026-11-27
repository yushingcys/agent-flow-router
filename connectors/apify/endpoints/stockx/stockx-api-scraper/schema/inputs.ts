import { z } from "zod";

/**
 * rl1987/stockx-api-scraper — actor input schema, scaffolded from the actor's PUBLISHED
 * input schema (GET /v2/acts/rl1987~stockx-api-scraper/builds/default →
 * actorDefinition.input) on 2026-11-27, in the
 * scripts/apify-scaffold.ts format, from the public build (no token); curated
 * by hand thereafter (re-run the script to refresh; the drift suite
 * flags divergence — deno task drift). Non-strict by policy: the actor
 * accepts supersets — unknown fields pass through.
 */
export const zStockxApiScraperBody = z.object({
    mode: z.enum(["search", "product", "salesHistory"]).describe(
        "What to scrape. Search finds products by keyword. Product lookup takes StockX product ids, slugs or URLs you already have. Sales history returns the individual sales behind a product's price chart, one row per sale.",
    ).optional(),
    q: z.string().describe(
        "Keywords to search for sneakers (e.g. 'Jordan 1 Retro High'). Give this or a category - an input with neither has no way in and collects nothing.",
    ).optional(),
    category: z.enum([
        "sneakers",
        "apparel",
        "accessories",
        "collectibles",
        "shoes",
        "trading-cards",
        "electronics",
        "streetwear",
        "watches",
        "handbags",
    ]).describe(
        "Scope the browse to one StockX category. Works on its own (no keyword needed) or alongside a search keyword. Three values from the old dropdown are not StockX categories and are redirected to the one that holds them, so saved tasks keep working.",
    ).optional(),
    brand: z.string().describe(
        "Scope to one brand, server-side. Works on its own or with any other filter. Spelling- and case-exact — Hoka One One works, HOKA ONE ONE does not. The value matches the brandName this Actor returns, so a brand you see in the output can be pasted straight back in. The list is the brands verified to...",
    ).optional(),
    gender: z.enum([
        "men",
        "women",
        "kids",
        "unisex",
        "infant",
        "toddler",
        "preschool",
        "child",
    ]).describe(
        "Scope to one gender or age group, server-side. These eight are the complete set StockX accepts — boys, girls, youth, male and female are not among them and are refused with an explanation rather than returning an empty run.",
    ).optional(),
    activity: z.string().describe(
        "Scope to one sport or activity, server-side. These nine are verified to return results; lifestyle, training, gym, walking and outdoor are not accepted. The list may be incomplete, so other values can be typed — one that matches nothing ends the run with a message saying so, unbilled.",
    ).optional(),
    sortBy: z.enum([
        "featured",
        "most-active",
        "lowest_ask",
        "highest_bid",
        "recent_bids",
        "recent_asks",
        "deadstock_sold",
        "release_date",
        "price_premium",
        "last_sale",
    ]).describe(
        "Order the results server-side. Each option carries the sort direction StockX itself declares for it (sending any other direction silently returns the default feed, so the direction is not a separate input).",
    ).optional(),
    minPrice: z.number().int().min(0).describe(
        "Keep only products whose lowest ask is at least this much, in the selected currency. StockX's API takes no price arguments, so this is applied by the Actor — but it is applied before billing, so filtered-out products are never charged.",
    ).optional(),
    maxPrice: z.number().int().min(0).describe(
        "Keep only products whose lowest ask is at most this much, in the selected currency. Applied by the Actor before billing, so filtered-out products are never charged.",
    ).optional(),
    productIds: z.array(z.any()).describe(
        "Used by Product lookup and Sales history. Each entry can be a StockX product id (019cfdb4-3545-7b24-8773-11f7411145fb), a product slug (air-jordan-1-retro-high-og-chicago-reimagined-lost-and-found) or a full product URL (https://stockx.com/air-jordan-1-retro-low-og-chicago-2025) — StockX accepts ...",
    ).optional(),
    maxSalesPerProduct: z.number().int().min(0).describe(
        "Sales history only. How many individual sales to collect per product, newest first. 0 = the whole history, which can be large — one popular Jordan 1 has over 18,000 sales. Sales are billed per row, so this is the knob that bounds the cost of a run: the default is 100.",
    ).optional(),
    salesSince: z.string().describe(
        "Sales history only. Stop at the first sale older than this date, e.g. 2026-01-01. The feed is newest-first, so this is a cheap way to ask for a recent window instead of the whole history.",
    ).optional(),
    country: z.string().describe(
        "Two-letter ISO 3166 country code selecting whose order book is quoted. A resale price is market-specific: for one product the lowest ask was 245 in US and 398 in GB, both in USD. Defaults to US, which is what every run returned before this input existed.",
    ).optional(),
    currency: z.enum([
        "USD",
        "EUR",
        "GBP",
        "JPY",
        "CAD",
        "AUD",
        "CHF",
        "HKD",
        "KRW",
        "MXN",
        "SEK",
        "PLN",
        "SGD",
        "NZD",
        "NOK",
        "DKK",
        "BRL",
        "CLP",
        "CNY",
        "HUF",
        "IDR",
        "ILS",
        "KWD",
        "MOP",
        "MYR",
        "PEN",
        "PHP",
        "THB",
        "TWD",
        "VND",
    ]).describe(
        "Currency the ask / bid / last-sale amounts are denominated in. Independent of the market: GB + USD gives the UK book priced in dollars. Every value listed here is accepted by StockX.",
    ).optional(),
    includeDetails: z.boolean().describe(
        "Fetch each product's detail page for description, release date, per-size market pricing (variantSizes, including a per-size bid-ask spread) and the 12-month statistics. Billing: a detail-enriched product is charged twice — once as a product-list row and once as a product-detail row. Off by defaul...",
    ).optional(),
    maxItems: z.number().int().min(0).describe(
        "Maximum number of products to scrape. 0 = all (no limit).",
    ).optional(),
    maxPages: z.number().int().min(0).describe(
        "Stop after this many result pages, for a predictable per-run cost. A page is about 40 products — StockX clamps the page size to 40 but has been measured returning 43 — so budget on the page count, not on an exact multiple of 40. 0 = no page limit. Note StockX reports a constant total: 1000 for ev...",
    ).optional(),
    proxyConfiguration: z.record(z.string(), z.any()).describe(
        "Route requests through a proxy (Apify Proxy by default).",
    ).optional(),
});
