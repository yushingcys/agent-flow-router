import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zTavilyMapBody } from "./schema/inputs.ts";

/**
 * POST /map - list a site's URLs without fetching content.
 *
 * BILLING: 1 credit per 10 pages returned, 2 per 10 with `instructions`.
 * Modeled as 0.1 credits per page plus a 0.1 instructions surcharge (see
 * provider.ts on fractional rates). `limit` takes the vendor default 50 at
 * the binding so the estimate holds a bounded page count.
 */
export default defineEndpoint({
    meta: {
        displayName: "Tavily Map",
        summary: "List a website's URLs without scraping content.",
        description: "Traverse a site from a root URL like a graph and " +
            "return the URLs it finds, without fetching page content - the " +
            "cheap reconnaissance step before a crawl or extract. Control " +
            "scope with `max_depth`, `max_breadth` and `limit`, keep or " +
            "drop URLs by path or domain regex, and steer discovery with " +
            "natural-language `instructions`. Costs 1 credit per 10 URLs " +
            "returned, 2 per 10 with instructions.",
        docsUrl: "https://docs.tavily.com/documentation/api-reference/" +
            "endpoint/map",
        categories: ["web-scraping"],
        notes: [
            "Synchronous: the request can run up to its `timeout` " +
            "(10-150 s, vendor default 150 s).",
        ],
    },
    request: { method: "POST", path: "/map" },
    input: {
        schema: {
            body: zTavilyMapBody.extend({
                limit: zTavilyMapBody.shape.limit.unwrap().default(50),
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
                    description: "1 credit per 10 pages returned",
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
            },
        },
        estimate: ({ data }) => {
            const body = data.input.body;
            return {
                counts: {
                    page: body.limit,
                    ...(body.instructions
                        ? { instructed_page: body.limit }
                        : {}),
                },
            };
        },
        evidence: ({ data, utils }) => {
            const pages = utils.json.optionalLen(data.output, "$.results") ?? 0;
            return {
                counts: {
                    page: pages,
                    ...(data.input.body.instructions
                        ? { instructed_page: pages }
                        : {}),
                },
            };
        },
    },
});
