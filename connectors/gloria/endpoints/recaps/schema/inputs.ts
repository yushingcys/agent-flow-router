import { z } from "zod";

/** `GET /recaps` (ai-hub.cryptobriefing.com/openapi.json and
 *  api-integration.md, read 2026-10-29). The REST route requires
 *  `timeframe`; the endpoint fills it from the category when omitted. */
export const zRecapsQuery = z.strictObject({
    feed_category: z.string().min(1).describe(
        "Feed category code to recap, e.g. crypto, macro, bitcoin.",
    ),
    timeframe: z.enum(["12h", "24h"]).describe(
        "News window. Each category publishes one: 12h for ai, " +
            "ai_agents, crypto, defi, machine_learning, macro, tech, " +
            "virtuals; 24h for the rest. Omit to use the category's own.",
    ).optional(),
});
