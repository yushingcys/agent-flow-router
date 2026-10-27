import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { z } from "zod";
import { zAgentBody } from "./schema/inputs.ts";

/**
 * Perplexity POST /v1/agent - the Agent API, successor of Sonar Chat
 * Completions (Sonar support ended 2026-09-27; Sonar requests are now
 * reformulated as Agent API requests). This endpoint runs Perplexity's own
 * grounded model, `perplexity/sonar`, with the web_search and fetch_url
 * tools: the answer text plus `search_results` items carrying the sources.
 *
 * Only perplexity/sonar, because the pre-run hold must be priced from the
 * request: third-party models, effort levels and profiles pick their
 * model and tool budget on the vendor's side and change price without
 * notice. Rates (https://docs.perplexity.ai/docs/agent-api/models and
 * /docs/getting-started/pricing, checked 2026-10-23): input $0.25/1M,
 * cache read $0.0625/1M, output $2.50/1M (reasoning at the output rate),
 * web_search $2.50/1k invocations ($1.00/1k fast), fetch_url $0.50/1k.
 *
 * The vendor's claim settles the bill (D27): every completed response
 * carries `usage.cost.total_cost` in USD; the rate card is the cross-check
 * and the fallback when the cost node is absent.
 */
export default defineEndpoint({
    meta: {
        displayName: "Perplexity Agent (Sonar)",
        summary:
            "A web-grounded answer with cited sources from Perplexity Sonar.",
        description: "Ask Perplexity's Sonar model a question and get a " +
            "written answer grounded in live web results, with the " +
            "sources it used. Add the web_search tool to let it search " +
            "(with domain, date, recency and location filters) and the " +
            "fetch_url tool to let it read specific pages; set max_steps " +
            "above 1 for multi-step research. The response is an output " +
            "array: `search_results` items list each source (id, url, " +
            "title, snippet, dates) and the `message` item holds the " +
            "answer text. Supports multi-turn message input, system " +
            "instructions, a response language and JSON-schema " +
            "structured output.",
        docsUrl: "https://docs.perplexity.ai/api-reference/agent-post",
        categories: ["ai-search"],
        notes: [
            "Web search is opt-in: without a web_search tool, Sonar answers " +
            "from its own knowledge and returns no sources.",
            "Inline citation markers such as [1] appear only when the " +
            "prompt asks for them; the id and url of each search_results " +
            "entry are the source of truth.",
            "Billing: tokens ($0.25 per 1M input, $2.50 per 1M output) " +
            "plus $0.0025 per web search ($0.001 with search_type fast) " +
            "and $0.0005 per URL fetch, settled from the response's own " +
            "usage.cost.total_cost.",
            "The pre-run hold covers your prompt, max_output_tokens and " +
            "one invocation of each tool per step. Search context tokens " +
            "are billed on top, so keep max_steps and the web_search " +
            "max_tokens budget tight for predictable cost.",
        ],
    },
    request: { method: "POST", path: "/v1/agent" },
    input: {
        schema: {
            // D25 binding: perplexity/sonar only (the priced model), the
            // caller states the output cap, and max_steps carries the
            // documented default of 1 for model requests.
            body: zAgentBody.extend({
                model: z.literal("perplexity/sonar").describe(
                    "Perplexity's grounded search model.",
                ).default("perplexity/sonar"),
                max_output_tokens: zAgentBody.shape.max_output_tokens
                    .unwrap(),
                max_steps: zAgentBody.shape.max_steps.unwrap().default(1),
            }),
        },
    },
    timeouts: { requestMs: 300_000, runMs: 300_000 },
    usage: {
        model: {
            kind: UsageModelKind.COMPOSITE,
            components: {
                input_tokens: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.TOKEN,
                    label: "input tokens",
                    description: "$0.25 per 1M uncached input tokens",
                    consumes: { credit: "default", amount: 0.00000025 },
                },
                cache_read_tokens: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.TOKEN,
                    label: "cached input tokens",
                    description: "$0.0625 per 1M input tokens read from cache",
                    consumes: { credit: "default", amount: 0.0000000625 },
                },
                output_tokens: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.TOKEN,
                    label: "output tokens",
                    description: "$2.50 per 1M output tokens, reasoning " +
                        "included",
                    consumes: { credit: "default", amount: 0.0000025 },
                },
                web_search: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    label: "web searches",
                    description: "$2.50 per 1,000 web_search invocations",
                    consumes: { credit: "default", amount: 0.0025 },
                },
                fast_search: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    label: "fast searches",
                    description: "$1.00 per 1,000 web_search invocations " +
                        "with search_type fast",
                    consumes: { credit: "default", amount: 0.001 },
                },
                fetch_url: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    label: "URL fetches",
                    description: "$0.50 per 1,000 fetch_url invocations",
                    consumes: { credit: "default", amount: 0.0005 },
                },
            },
        },
        /** Prompt tokens are bounded by the UTF-8 byte count of the
         *  caller's text (every BPE token consumes at least one byte), the
         *  output by max_output_tokens, and each declared tool by one
         *  invocation per step. */
        estimate: ({ data }) => {
            const body = data.input.body;
            const texts = typeof body.input === "string"
                ? [body.input]
                : body.input.flatMap((m) =>
                    typeof m.content === "string"
                        ? [m.content]
                        : m.content.map((p) => p.text)
                );
            if (body.instructions !== undefined) texts.push(body.instructions);
            let bytes = 0;
            for (const text of texts) {
                for (const ch of text) {
                    const cp = ch.codePointAt(0) ?? 0;
                    bytes += cp <= 0x7f
                        ? 1
                        : cp <= 0x7ff
                        ? 2
                        : cp <= 0xffff
                        ? 3
                        : 4;
                }
            }
            const tools = body.tools ?? [];
            const fast = tools.filter((t) =>
                t.type === "web_search" && t.search_type === "fast"
            ).length;
            const web = tools.filter((t) =>
                t.type === "web_search"
            ).length -
                fast;
            const fetches = tools.filter((t) => t.type === "fetch_url").length;
            const steps = body.max_steps;
            return {
                counts: {
                    input_tokens: bytes,
                    output_tokens: body.max_output_tokens,
                    ...(web > 0 ? { web_search: web * steps } : {}),
                    ...(fast > 0 ? { fast_search: fast * steps } : {}),
                    ...(fetches > 0 ? { fetch_url: fetches * steps } : {}),
                },
            };
        },
        /** The response's own usage: cached input tokens are reported
         *  inside input_tokens, and fast searches under search_web, so the
         *  request's search_type picks the search line. */
        evidence: ({ data, utils }) => {
            const [input, cached, output, searches, fetches] = [
                "$.usage.input_tokens",
                "$.usage.input_tokens_details.cache_read_input_tokens",
                "$.usage.output_tokens",
                "$.usage.tool_calls_details.search_web.invocation",
                "$.usage.tool_calls_details.fetch_url.invocation",
            ].map((path) => {
                const v = utils.json.optionalGet(data.output, path);
                return typeof v === "number" ? v : 0;
            });
            const tools = utils.json.optionalGet(
                data.input.body ?? {},
                "$.tools",
            );
            const fast = Array.isArray(tools) &&
                tools.some((t) =>
                    utils.json.optionalGet(t, "$.search_type") === "fast"
                );
            return {
                counts: {
                    input_tokens: Math.max(0, input - cached),
                    output_tokens: output,
                    ...(cached > 0 ? { cache_read_tokens: cached } : {}),
                    ...(searches > 0
                        ? fast
                            ? { fast_search: searches }
                            : { web_search: searches }
                        : {}),
                    ...(fetches > 0 ? { fetch_url: fetches } : {}),
                },
            };
        },
        /** The vendor's own meter: `usage.cost` leaves the payload, its
         *  `total_cost` (USD) is the claim. Omitted when absent. */
        consolidate: ({ data, utils }) => {
            const { value, rest } = utils.json.pluck(
                data.output,
                "$.usage.cost",
            );
            const total = value === undefined
                ? undefined
                : utils.json.optionalGet(value, "$.total_cost");
            return {
                credits: {
                    ...(typeof total === "number" ? { default: total } : {}),
                },
                output: rest,
            };
        },
    },
});
