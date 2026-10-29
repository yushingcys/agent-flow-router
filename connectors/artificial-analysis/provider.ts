import { defineProvider, presets, UsageModelKind } from "@shared/core";

/**
 * Artificial Analysis (artificialanalysis.ai) - independent benchmarks of
 * AI models: intelligence indices, speed, latency, prices, and arena Elo
 * rankings for image, video, and speech models.
 *
 * Monid lists a parse.bot scraper of the website (snake_case tool names,
 * docUrl parse.bot/marketplace/artificialanalysis-ai-api). We keep Monid's
 * ids via `endpoint` and call the vendor's own V2 Data API instead
 * (`https://artificialanalysis.ai/api/v2`, OpenAPI at `/api/v2/openapi`,
 * read 2026-10-29), `x-api-key` header auth. The legacy `/api/v2/data/*`
 * routes the older documentation page shows retire on 2026-11-04 (410
 * Gone after), so nothing here calls them.
 *
 * Billing: FREE. The vendor charges nothing per request; its tiers (Free,
 * Pro, Commercial) are subscriptions that gate WHICH routes a key may call
 * (others answer 403) and size a fixed 24-hour request quota (Free 100).
 * There is no per-call meter to model, so no credit pool is declared.
 */
export default defineProvider({
    name: "artificial-analysis",
    meta: {
        displayName: "Artificial Analysis",
        summary: "Independent AI model benchmarks: intelligence, speed, " +
            "price, and arena rankings.",
        description: "Independent benchmarks of language models (the " +
            "Artificial Analysis Intelligence Index and capability indices, " +
            "output speed, time to first token, token prices, cost to run " +
            "the index) and arena Elo rankings for text-to-image, image " +
            "editing, text-to-video, image-to-video, text-to-speech, " +
            "speech-to-speech, and speech-to-text models.",
        homepageUrl: "https://artificialanalysis.ai",
        docsUrl: "https://artificialanalysis.ai/data-api/docs",
        categories: ["model-benchmarks"],
        notes: [
            "Attribution to https://artificialanalysis.ai/ is required " +
            "wherever this data is displayed or shared.",
            "Each key tier unlocks different routes: a route above the " +
            "key's tier answers 403. Free keys get 100 requests per fixed " +
            "24-hour window; a 429 means the window's quota is spent.",
            "Prefer model and creator `id`s as stable identifiers; names " +
            "and slugs can change.",
        ],
    },
    auth: { inject: presets.auth.header("x-api-key") },
    request: { baseUrl: "https://artificialanalysis.ai/api/v2" },
    timeouts: { requestMs: 30_000, runMs: 30_000 },
    usage: { model: { kind: UsageModelKind.FREE } },
    output: {
        /** Error envelope: `{"error": "Invalid API key."}`. */
        fromError: ({ data, utils }) => {
            const error = utils.json.optionalGet(data.output, "$.error");
            return {
                message: typeof error === "string" && error !== ""
                    ? error
                    : "Artificial Analysis API error",
                raw: data.output,
            };
        },
    },
});
