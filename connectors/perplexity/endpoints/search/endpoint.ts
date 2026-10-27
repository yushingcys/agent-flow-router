import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { z } from "zod";
import { zSearchBody } from "./schema/inputs.ts";

/**
 * Perplexity POST /search - ranked web results, no generated answer.
 *
 * Billed per successful request, whatever the number of queries (up to 5)
 * or results: $5.00 per 1,000 for web search, $1.00 per 1,000 for Fast
 * Search (https://docs.perplexity.ai/docs/getting-started/pricing, checked
 * 2026-10-23). The response carries no cost field, so the bill is the
 * card. People Search has no published Search API price, so the binding
 * offers web and fast only.
 */
export default defineEndpoint({
    meta: {
        displayName: "Perplexity Search",
        summary:
            "Ranked web results with page snippets from Perplexity's index.",
        description: "Search the web with Perplexity's Search API and get " +
            "ranked results as JSON: title, URL, an extracted content " +
            "snippet and publication / last-updated dates for each page. " +
            "Send one query or up to five related queries in one request. " +
            "Filter by domain, recency, publication or update date, " +
            "country and language, and cap how much page content comes " +
            "back. Use it when your own code or model should read the " +
            "sources; use Perplexity Agent for a written, cited answer.",
        docsUrl: "https://docs.perplexity.ai/api-reference/search-post",
        categories: ["web-search"],
        notes: [
            "Billing: $0.005 per request with search_type web, $0.001 " +
            "with search_type fast. A request with several queries is " +
            "one request.",
            "With an array query, results are split across the queries; " +
            "max_results is the total for the request.",
        ],
    },
    request: { method: "POST", path: "/search" },
    input: {
        schema: {
            // vendor default search_type "web" applied at the binding (it
            // selects the price); people search is unpriced, so not offered,
            // and above 20 results needs people search.
            body: zSearchBody.extend({
                search_type: z.enum(["web", "fast"]).describe(
                    "web = standard search ($0.005), fast = lower-latency " +
                        "Fast Search ($0.001).",
                ).default("web"),
                max_results: zSearchBody.shape.max_results.unwrap().max(20)
                    .optional(),
            }),
        },
    },
    usage: {
        model: {
            kind: UsageModelKind.COMPOSITE,
            components: {
                web_search: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    label: "web search request",
                    description: "$5.00 per 1,000 requests (search_type web)",
                    consumes: { credit: "default", amount: 0.005 },
                },
                fast_search: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    label: "fast search request",
                    description: "$1.00 per 1,000 requests (search_type fast)",
                    consumes: { credit: "default", amount: 0.001 },
                },
            },
        },
        estimate: ({ data }) => ({
            counts: data.input.body.search_type === "fast"
                ? { fast_search: 1 }
                : { web_search: 1 },
        }),
        // post-toRequest body: search_type carries the binding default
        evidence: ({ data, utils }) => ({
            counts: utils.json.optionalGet(
                    data.input.body ?? {},
                    "$.search_type",
                ) === "fast"
                ? { fast_search: 1 }
                : { web_search: 1 },
        }),
    },
});
