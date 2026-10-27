import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zTavilySearchBody } from "./schema/inputs.ts";

/**
 * POST /search - ranked web results with content snippets.
 *
 * BILLING: 1 credit per search, 2 for `search_depth: "advanced"`. One
 * PER_UNIT credit line counts 1 or 2. `auto_parameters` may upgrade the
 * depth server-side, so the estimate holds 2 whenever it is on and depth
 * is not pinned, and the settle reads the depth Tavily reports back.
 *
 * Search is the one Tavily meter that is exact per request, so toRequest
 * always sends `include_usage: true` and consolidate lifts `usage.credits`
 * out of the payload as the vendor's claim (D27).
 */
export default defineEndpoint({
    meta: {
        displayName: "Tavily Search",
        summary: "Search the web and get ranked results with snippets.",
        description: "Search the live web and get ranked results with " +
            "title, URL, relevance score and query-relevant content " +
            "snippets, optionally with an LLM-written answer, each " +
            "result's full page content, images and favicons. Filter by " +
            "topic ('general', 'news', 'finance'), time range or dates, " +
            "and include or exclude domains; boost a country or language; " +
            "trade latency for relevance with `search_depth`. Costs 1 " +
            'credit per search, 2 with `search_depth: "advanced"`.',
        docsUrl: "https://docs.tavily.com/documentation/api-reference/" +
            "endpoint/search",
        categories: ["web-search"],
        notes: [
            "`auto_parameters: true` may switch search_depth to " +
            "'advanced' (2 credits); set search_depth explicitly to cap " +
            "the cost at 1.",
            "`include_domains_mode` without `include_domains`, and " +
            "`filter_by_language` without `language`, return 400.",
            "`chunks_per_source` is ignored for 'ultra-fast', and " +
            "`safe_search` is not supported for 'fast' or 'ultra-fast'.",
        ],
    },
    request: { method: "POST", path: "/search" },
    input: {
        schema: { body: zTavilySearchBody.omit({ include_usage: true }) },
        toRequest: ({ data, utils }) => ({
            ...data.input,
            body: utils.json.merge(data.input.body ?? {}, {
                include_usage: true,
            }),
        }),
    },
    usage: {
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.CREDIT,
            label: "search credits",
            description: "1 per search, 2 for advanced depth",
            consumes: { credit: "default", amount: 1 },
        },
        estimate: ({ data }) => {
            const depth = data.input.body.search_depth;
            const advanced = depth === "advanced" ||
                (depth === undefined &&
                    data.input.body.auto_parameters === true);
            return { counts: { CREDIT: advanced ? 2 : 1 } };
        },
        evidence: ({ data, utils }) => {
            const depth = utils.json.optionalGet(
                data.output,
                "$.auto_parameters.search_depth",
            ) ?? data.input.body.search_depth;
            return { counts: { CREDIT: depth === "advanced" ? 2 : 1 } };
        },
        consolidate: ({ data, utils }) => {
            const { value, rest } = utils.json.pluck(data.output, "$.usage");
            const credits = value === undefined
                ? undefined
                : utils.json.optionalNum(value, "$.credits");
            return {
                credits: {
                    ...(credits !== undefined ? { default: credits } : {}),
                },
                output: rest,
            };
        },
    },
});
