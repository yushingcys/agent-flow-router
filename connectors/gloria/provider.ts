import { defineProvider, presets, UsageModelKind } from "@shared/core";

/**
 * Gloria (itsgloria.ai) - curated crypto and markets news, AI recaps,
 * ticker summaries, and Polymarket scorings from Crypto Briefing's
 * Gloria Data Platform.
 *
 * Monid sells Gloria's x402 surface (`https://api.itsgloria.ai/<path>`,
 * slug `api.itsgloria.ai`; a provider name here cannot carry a dot -
 * design D1). We call the token REST API instead,
 * `https://ai-hub.cryptobriefing.com`, with the account's API token as
 * `Authorization: Bearer` (the REST API also takes `?token=`, which we
 * never use so the token stays out of URLs). Ids keep Monid's paths
 * (`endpoint:`); `request.path` is the REST route
 * (docs: github.com/cryptobriefing/gloria-docs, the live OpenAPI at
 * ai-hub.cryptobriefing.com/openapi.json, read 2026-10-29).
 *
 * Rate card: a token is a plan entitlement scoped to feed categories,
 * with no per-call meter in the response, so every endpoint is PER_CALL
 * 1 against one `default` pool of requests.
 */
export default defineProvider({
    name: "gloria",
    meta: {
        displayName: "Gloria",
        summary: "Curated real-time crypto and markets news, recaps, " +
            "ticker summaries, and Polymarket signals.",
        description: "Gloria AI monitors crypto and markets news in real " +
            "time and filters noise from substance: headlines with " +
            "sentiment, context, sources, and ticker tags by feed " +
            "category or keyword; AI recaps of the last 12-24 hours per " +
            "category; a 24-hour summary for any token; and " +
            "direction-and-magnitude scorings of news against Polymarket " +
            "markets.",
        homepageUrl: "https://www.itsgloria.ai",
        docsUrl:
            "https://github.com/cryptobriefing/gloria-docs/blob/main/docs/gloria-data-platform/api-integration.md",
        categories: ["news-search", "crypto-signals"],
        notes: [
            "Feed category codes: ai, ai_agents, base, bitcoin, crypto, " +
            "dats, defi, ethereum, hyperliquid, machine_learning, macro, " +
            "on_chain_whale, perps, ripple, rwa, solana, tech, " +
            "token_listings, virtuals.",
            "An API token is scoped to the feed categories chosen when it " +
            "was created; asking for another category fails with 403.",
        ],
    },
    auth: { inject: presets.auth.bearer() },
    request: { baseUrl: "https://ai-hub.cryptobriefing.com" },
    // The summary and recap routes are LLM-backed; give them room.
    timeouts: { requestMs: 60_000, runMs: 60_000 },
    usage: {
        credits: { default: { label: "Gloria API requests" } },
        model: {
            kind: UsageModelKind.PER_CALL,
            label: "request",
            consumes: { credit: "default", amount: 1 },
        },
    },
    output: {
        /** FastAPI error envelope: `{"detail": "Missing token"}`, or a
         *  validation list `{"detail": [{"msg": ...}]}` on 422. */
        fromError: ({ data, utils }) => {
            const detail = utils.json.optionalGet(data.output, "$.detail");
            const first = utils.json.optionalGet(
                data.output,
                "$.detail[0].msg",
            );
            return {
                message: typeof detail === "string" && detail !== ""
                    ? detail
                    : typeof first === "string"
                    ? first
                    : "Gloria API error",
                raw: data.output,
            };
        },
    },
});
