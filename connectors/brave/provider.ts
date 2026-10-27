import { defineProvider, presets, UsageModelKind } from "@shared/core";

/**
 * Brave Search API (brave.com/search/api) — results from Brave's own
 * independent web index: web, news, images, videos, and LLM Context.
 * Synchronous GETs against `https://api.search.brave.com/res/v1`,
 * auth `X-Subscription-Token`.
 *
 * Rate card (api-dashboard.search.brave.com/documentation/pricing,
 * verified 2026-10-23): every endpoint here is on the prepaid "Search"
 * plan at $5 per 1,000 requests, so the native meter is requests — one
 * pool `default`, PER_CALL 1. The vendor bills every request, empty
 * results included, and responses carry no usage receipt, so there is
 * no `consolidate`: the derived fold is the bill.
 *
 * Not exposed: Answers (separate plan priced per query plus tokens),
 * Autosuggest and Spellcheck (separate plans at $5 per 10,000), the
 * summarizer (needs a web search `summary` key and its own plan), and
 * the two-step local/rich follow-ups (ephemeral ids from a prior call).
 */
export default defineProvider({
    name: "brave",
    meta: {
        displayName: "Brave Search",
        summary: "Independent-index web, news, image, and video search, " +
            "plus LLM-ready grounding context.",
        description: "Search Brave's own web index (no Google or Bing " +
            "pass-through) and get web results, news articles, images, " +
            "or videos, or LLM Context: ranked, extracted page passages " +
            "sized to a token budget for grounding a model. Filter by " +
            "country, language, freshness (past day/week/month/year or " +
            "a date range), and safe search; re-rank with Goggles; " +
            "request up to five extra snippets per result.",
        homepageUrl: "https://brave.com/search/api/",
        docsUrl: "https://api-dashboard.search.brave.com/documentation",
        categories: ["web-search"],
        notes: [
            "One request per call at $5 per 1,000 requests, billed even " +
            "when the result list is empty.",
            "Search operators (`site:`, `filetype:`, quotes, `-term`) go " +
            "inside `q`, not as separate parameters.",
        ],
    },
    auth: { inject: presets.auth.header("X-Subscription-Token") },
    request: { baseUrl: "https://api.search.brave.com" },
    timeouts: { requestMs: 30_000, runMs: 30_000 },
    usage: {
        /** THE credit system (design D26): Brave meters requests; the
         *  $/request conversion is the wallet RATE_CARD `brave:default`
         *  row. */
        credits: { default: { label: "Brave Search requests" } },
        model: {
            kind: UsageModelKind.PER_CALL,
            label: "request",
            consumes: { credit: "default", amount: 1 },
        },
    },
    output: {
        /** Brave error envelope: `{type: "ErrorResponse", error: {id,
         *  status, code, detail, meta}, time}`. */
        fromError: ({ data, utils }) => {
            const detail = utils.json.optionalGet(
                data.output,
                "$.error.detail",
            );
            const code = utils.json.optionalGet(data.output, "$.error.code");
            const text = [detail, code].find((v) =>
                typeof v === "string" && v !== ""
            );
            return {
                message: typeof text === "string" ? text : "Brave Search error",
                raw: data.output,
            };
        },
    },
});
