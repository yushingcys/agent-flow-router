import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zTavilyExtractBody } from "./schema/inputs.ts";

/**
 * POST /extract - clean page content from up to 20 URLs.
 *
 * BILLING: 1 credit per 5 successful URLs, 2 per 5 with `extract_depth:
 * "advanced"`; failed URLs are free. Modeled as 0.2 credits per successful
 * URL plus a 0.2 advanced surcharge (see provider.ts on fractional rates).
 * No consolidate: Tavily's per-request `usage` accrues across requests, so
 * the derived fold settles.
 */
export default defineEndpoint({
    meta: {
        displayName: "Tavily Extract",
        summary: "Extract clean markdown or text from up to 20 URLs.",
        description: "Fetch one URL or up to 20 at once and get each " +
            "page's main content as clean markdown or plain text, " +
            "optionally with images and favicon. Pass `query` to rerank " +
            "the page's content chunks by relevance and keep only the top " +
            '`chunks_per_source`. `extract_depth: "advanced"` also ' +
            "captures tables and embedded content. Pages that could not " +
            "be fetched come back in `failed_results` and are not billed. " +
            "Costs 1 credit per 5 successful URLs, 2 with advanced depth.",
        docsUrl: "https://docs.tavily.com/documentation/api-reference/" +
            "endpoint/extract",
        categories: ["web-scraping"],
        notes: [
            "A 200 response can carry an empty `results` array when every " +
            "URL failed; check `failed_results`. Output order is not " +
            "guaranteed to match the input order.",
            "`chunks_per_source` only applies when `query` is set.",
        ],
    },
    request: { method: "POST", path: "/extract" },
    input: { schema: { body: zTavilyExtractBody } },
    usage: {
        model: {
            kind: UsageModelKind.COMPOSITE,
            components: {
                extraction: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.PAGE,
                    label: "extracted URLs",
                    description: "1 credit per 5 successful URLs",
                    consumes: { credit: "default", amount: 0.2 },
                },
                advanced_extraction: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.PAGE,
                    label: "advanced extraction",
                    description: "the extra 1 credit per 5 successful URLs " +
                        "at advanced depth",
                    consumes: { credit: "default", amount: 0.2 },
                },
            },
        },
        estimate: ({ data }) => {
            const body = data.input.body;
            const urls = typeof body.urls === "string" ? 1 : body.urls.length;
            return {
                counts: {
                    extraction: urls,
                    ...(body.extract_depth === "advanced"
                        ? { advanced_extraction: urls }
                        : {}),
                },
            };
        },
        evidence: ({ data, utils }) => {
            const pages = utils.json.optionalLen(data.output, "$.results") ?? 0;
            return {
                counts: {
                    extraction: pages,
                    ...(data.input.body.extract_depth === "advanced"
                        ? { advanced_extraction: pages }
                        : {}),
                },
            };
        },
    },
});
