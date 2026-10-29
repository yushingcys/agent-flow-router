import { defineEndpoint } from "@shared/core";
import { zPmScoringsQuery } from "./schema/inputs.ts";

/** GET /pm/scorings - Monid's x402 `/pm-scorings`. */
export default defineEndpoint({
    meta: {
        displayName: "Polymarket News Scorings",
        summary: "Latest news-driven direction and magnitude scorings " +
            "for Polymarket markets.",
        description: "Get the latest scorings of news headlines against " +
            "Polymarket markets. Each row scores one (headline, market) " +
            "pair with a direction (up, down, none), a 0-1 confidence, a " +
            "signed magnitude in points, a composite tier (SKIP, WATCH, " +
            "TRADE), the market's current price, and the reasoning. " +
            "Filter by tier, event, or market.",
        docsUrl: "https://ai-hub.cryptobriefing.com/docs",
        categories: ["prediction-markets", "crypto-signals"],
    },
    endpoint: "/pm-scorings",
    request: { method: "GET", path: "/pm/scorings" },
    input: { schema: { queryParams: zPmScoringsQuery } },
});
