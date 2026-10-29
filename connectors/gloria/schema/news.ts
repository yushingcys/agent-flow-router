import { z } from "zod";

/**
 * `GET /news` query parameters (ai-hub.cryptobriefing.com/openapi.json,
 * read 2026-10-29). Shared by gloria#news and gloria#news-by-keyword,
 * which bind the same route. Mirror carries optionality only (D25).
 */
export const newsParams = {
    feed_categories: z.string().describe(
        "Comma-separated feed category codes, e.g. crypto,ai_agents " +
            "(vendor default: every category the token may read). Use " +
            "token_listings for exchange listings only.",
    ).optional(),
    exclude_categories: z.string().describe(
        "Comma-separated category codes to drop, e.g. on_chain_whale " +
            "(max 20).",
    ).optional(),
    exclude_official_kinds: z.string().describe(
        "Comma-separated official_kind labels to drop from official " +
            "items: upgrade, launch, partnership, integration, listing, " +
            "governance, security, token, treasury, event, promo, other " +
            "(vendor default promo).",
    ).optional(),
    from_date: z.iso.date().describe(
        "Start date, YYYY-MM-DD, inclusive (vendor default 7 days ago).",
    ).optional(),
    to_date: z.iso.date().describe(
        "End date, YYYY-MM-DD, inclusive (vendor default today).",
    ).optional(),
    limit: z.int().min(1).describe(
        "Items per page, 1-100; larger values are capped at 100 (vendor " +
            "default 20).",
    ).optional(),
    page: z.int().min(1).describe(
        "Page number from 1 (offset paging; prefer after).",
    ).optional(),
    after: z.string().describe(
        "Keyset cursor: the id of the last item of the page you just " +
            "read. Cannot be combined with page.",
    ).optional(),
    tickers: z.string().describe(
        "Comma-separated symbols, e.g. BTC,NVDA,BRK.B.",
    ).optional(),
    asset_class: z.string().describe(
        "Comma-separated asset classes: crypto, equity, etf, index, fx, " +
            "commodity.",
    ).optional(),
    public_id: z.string().describe(
        "Comma-separated public asset ids (cg:, figi:, cik: or tok:), " +
            "e.g. cg:zcash,figi:BBG000BLNNH6.",
    ).optional(),
    primary: z.boolean().describe(
        "Only items whose first (most relevant) tag is the requested " +
            "asset. Needs tickers, asset_class or public_id.",
    ).optional(),
    source: z.string().describe(
        "official returns the asset's official items and posts from its " +
            "own X account; stories returns only Gloria stories. Needs " +
            "tickers, asset_class or public_id.",
    ).optional(),
    rollups: z.boolean().describe(
        "Fold routine items about one coin (fund flows, price action, " +
            "whale transfers) into one rollup per kind and day. Applies " +
            "to single-coin queries only.",
    ).optional(),
};

export const zKeyword = z.string().min(1).describe(
    "Text to search headlines and context for, e.g. bitcoin.",
);
