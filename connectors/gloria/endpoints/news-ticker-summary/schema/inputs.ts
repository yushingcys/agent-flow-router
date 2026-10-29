import { z } from "zod";

/** `GET /news-ticker-summary` (ai-hub.cryptobriefing.com/openapi.json,
 *  read 2026-10-29). */
export const zNewsTickerSummaryQuery = z.strictObject({
    ticker: z.string().min(1).describe(
        "Token symbol or name, e.g. SOL, Solana, ZRO, LayerZero.",
    ),
});
