import { z } from "zod";
import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zExtractCrawlQuery } from "./schema/inputs.ts";

/**
 * GET /search?engine=extract&mode=crawl
 *
 * BILLING: one search credit per successfully extracted page (SerpApi's
 * crawl-mode docs), reported back as `search_metadata.credits_consumed`.
 * `max_pages` takes the vendor default 10 at the binding so the estimate
 * holds a bounded page count.
 */
export default defineEndpoint({
    meta: {
        displayName: "Crawl Website Pages",
        summary: "Crawl a website from a start URL and extract structured " +
            "content from each page.",
        description: "Follow links on the same website from a start URL " +
            "and extract every page visited: page information, headings, " +
            "text, links, media, lists and tables, structured data, and " +
            "optional Markdown. Bound the crawl with `max_pages` (1-100, " +
            "default 10) and `max_depth` (0-3, default 2). Runs SerpApi's " +
            "`extract` engine in `crawl` mode.",
        docsUrl: "https://serpapi.com/extract-crawl-mode",
        categories: ["web-extraction"],
        notes: [
            "Billed per successfully extracted page; pages that fail " +
            "carry an `error` and are free.",
            "The Extract API does not run JavaScript.",
        ],
    },
    endpoint: "/extract/crawl",
    request: { method: "GET", path: "/search" },
    timeouts: { requestMs: 300_000, runMs: 300_000 },
    input: {
        schema: {
            queryParams: zExtractCrawlQuery.extend({
                engine: zEngine("extract"),
                mode: z.literal("crawl").default("crawl").describe(
                    "Extract mode. Fixed to crawl for this endpoint.",
                ),
                max_pages: zExtractCrawlQuery.shape.max_pages.unwrap()
                    .default(10),
            }),
        },
    },
    usage: {
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.RESULT,
            label: "extracted page",
            consumes: { credit: "default", amount: 1 },
        },
        estimate: ({ data }) => ({
            counts: { RESULT: data.input.queryParams.max_pages },
        }),
        evidence: ({ data, utils }) => {
            const pages = utils.json.optionalGet(data.output, "$.pages");
            const ok = Array.isArray(pages)
                ? pages.filter((page) =>
                    !(typeof page === "object" && page !== null &&
                        "error" in page)
                ).length
                : 0;
            return { counts: { RESULT: ok } };
        },
        consolidate: ({ data, utils }) => {
            const used = utils.json.optionalNum(
                data.output,
                "$.search_metadata.credits_consumed",
            );
            return {
                credits: { ...(used === undefined ? {} : { default: used }) },
            };
        },
    },
});
