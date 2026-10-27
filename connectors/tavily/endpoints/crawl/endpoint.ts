import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zTavilyCrawlBody } from "./schema/inputs.ts";

/**
 * POST /crawl - traverse a site and extract every page it reaches.
 *
 * BILLING: mapping cost + extraction cost (vendor example: 10 pages at
 * basic depth = 1 + 2 = 3 credits). Four lines, each counted per returned
 * page: mapping 0.1, the instructions mapping surcharge 0.1, extraction
 * 0.2, the advanced extraction surcharge 0.2. Pages mapped but not
 * returned are not counted - Tavily does not report them separately.
 * `limit` takes the vendor default 50 at the binding so the estimate holds
 * a bounded page count.
 */
export default defineEndpoint({
    meta: {
        displayName: "Tavily Crawl",
        summary: "Crawl a website and extract each page's content.",
        description: "Traverse a site from a root URL and return each page " +
            "reached with its content as markdown or text, in one " +
            "synchronous request. Control scope with `max_depth`, " +
            "`max_breadth` and `limit`, keep or drop URLs by path or domain " +
            "regex, and steer the crawler with natural-language " +
            "`instructions` (which also reranks each page's content to the " +
            "top `chunks_per_source` chunks). Costs the map rate (1 credit " +
            "per 10 pages, 2 with instructions) plus the extract rate (1 " +
            "credit per 5 pages, 2 with advanced depth).",
        docsUrl: "https://docs.tavily.com/documentation/api-reference/" +
            "endpoint/crawl",
        categories: ["web-scraping"],
        notes: [
            "Synchronous: the request can run up to its `timeout` " +
            "(10-150 s, vendor default 150 s).",
            "The default `limit` of 50 pages can cost up to 15 credits at " +
            "basic depth; lower it, or run Tavily Map first, to stay cheap.",
            "`chunks_per_source` only applies when `instructions` is set.",
        ],
    },
    request: { method: "POST", path: "/crawl" },
    input: {
        schema: {
            body: zTavilyCrawlBody.extend({
                limit: zTavilyCrawlBody.shape.limit.unwrap().default(50),
            }),
        },
    },
    usage: {
        model: {
            kind: UsageModelKind.COMPOSITE,
            components: {
                page: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.PAGE,
                    label: "mapped pages",
                    description: "1 credit per 10 pages",
                    consumes: { credit: "default", amount: 0.1 },
                },
                instructed_page: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.PAGE,
                    label: "instructed mapping",
                    description: "the extra 1 credit per 10 pages when " +
                        "instructions are set",
                    consumes: { credit: "default", amount: 0.1 },
                },
                extraction: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.PAGE,
                    label: "extracted pages",
                    description: "1 credit per 5 pages",
                    consumes: { credit: "default", amount: 0.2 },
                },
                advanced_extraction: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.PAGE,
                    label: "advanced extraction",
                    description: "the extra 1 credit per 5 pages at " +
                        "advanced depth",
                    consumes: { credit: "default", amount: 0.2 },
                },
            },
        },
        estimate: ({ data }) => {
            const body = data.input.body;
            const pages = body.limit;
            return {
                counts: {
                    page: pages,
                    extraction: pages,
                    ...(body.instructions ? { instructed_page: pages } : {}),
                    ...(body.extract_depth === "advanced"
                        ? { advanced_extraction: pages }
                        : {}),
                },
            };
        },
        evidence: ({ data, utils }) => {
            const body = data.input.body;
            const pages = utils.json.optionalLen(data.output, "$.results") ?? 0;
            return {
                counts: {
                    page: pages,
                    extraction: pages,
                    ...(body.instructions ? { instructed_page: pages } : {}),
                    ...(body.extract_depth === "advanced"
                        ? { advanced_extraction: pages }
                        : {}),
                },
            };
        },
    },
});
