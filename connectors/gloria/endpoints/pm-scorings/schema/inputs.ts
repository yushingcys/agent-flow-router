import { z } from "zod";

/** `GET /pm/scorings` (ai-hub.cryptobriefing.com/openapi.json, read
 *  2026-10-29). Mirror carries optionality only (D25). */
export const zPmScoringsQuery = z.strictObject({
    limit: z.int().min(1).max(500).describe(
        "Max rows to return, 1-500 (vendor default 50).",
    ).optional(),
    tier: z.enum(["SKIP", "WATCH", "TRADE"]).describe(
        "Only rows with this composite tier.",
    ).optional(),
    event_id: z.string().describe("Only rows for this Polymarket event id.")
        .optional(),
    market_id: z.string().describe(
        "Only rows for this Polymarket market id.",
    ).optional(),
});
