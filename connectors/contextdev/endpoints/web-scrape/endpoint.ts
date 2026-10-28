import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zScrapeBody } from "./schema/inputs.ts";

export default defineEndpoint({
    meta: {
        displayName: "Scrape Anything",
        summary:
            "Scrape one URL into any mix of Markdown, HTML, screenshot, images, JSON, product data, or a prebuilt parser.",
        description: "One page visit, every output you choose: set " +
            "formats to get Markdown, rendered HTML, a screenshot, page " +
            "images, the original bytes, query-relevant highlights, a JSON " +
            "object matching your JSON Schema, normalized product details, " +
            "or fields from custom CSS rules - together, from one call. " +
            "Prebuilt parsers turn a URL into structured records with no " +
            "rules to write: Google Maps places and up to 1,000 reviews, " +
            "App Store and Google Play apps and reviews, G2 reviews, " +
            "Instagram profiles, posts and feeds, TikTok profiles, videos, " +
            "feeds, comments, followers and user search, and a page's " +
            "emails, phone numbers, or links. JavaScript rendering and " +
            "proxies are always on; browser actions (click, type, scroll, " +
            "wait), country routing, custom headers, content filtering, " +
            "PDF page ranges and OCR, and cache freshness are " +
            "configurable. Each output reports requested/success/data.",
        docsUrl: "https://docs.context.dev/api-reference/web-scraping/scrape",
        categories: ["web-extraction"],
        notes: [
            "1 credit base, 2 with browser actions; +1 for highlights that " +
            "return a passage, +4 for a successful JSON extraction, +1 for " +
            "a product result, and +1 per PDF page recovered by OCR. No " +
            "charge when every output fails.",
        ],
    },
    request: { method: "POST", path: "/web/scrape" },
    input: { schema: { body: zScrapeBody } },
    timeouts: { requestMs: 310_000, runMs: 310_000 },
    usage: {
        /** https://docs.context.dev/account/credits (2026-10-27, "Scrape
         *  modifiers"): a 1-credit base, +1 with browser actions (keyed
         *  from the REQUEST), and per-output surcharges that bill only
         *  when the output SUCCEEDS (keyed from the response's own
         *  `success` flags; highlights only with a passage). OCR'd PDF
         *  pages have no response count and settle through the vendor's
         *  claim, as on web/crawl. */
        model: {
            kind: UsageModelKind.COMPOSITE,
            components: {
                scrape: {
                    kind: UsageModelKind.PER_CALL,
                    label: "base fee",
                    consumes: { credit: "default", amount: 1 },
                },
                actions_surcharge: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.CREDIT,
                    label: "browser actions surcharge",
                    description: "the extra credit browser actions add",
                    consumes: { credit: "default", amount: 1 },
                },
                highlights: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    label: "highlights",
                    description: "a highlights output with a passage",
                    consumes: { credit: "default", amount: 1 },
                },
                json: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    label: "JSON extractions",
                    description: "a JSON output that ran and succeeded",
                    consumes: { credit: "default", amount: 4 },
                },
                product: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    label: "product results",
                    description: "a successful product output, " +
                        "isProductPage false included",
                    consumes: { credit: "default", amount: 1 },
                },
            },
        },
        /** The ceiling the request can reach: every requested surcharge
         *  output succeeds. */
        estimate: ({ data }) => ({
            counts: {
                actions_surcharge:
                    data.input.body.sharedParams?.actions !== undefined ? 1 : 0,
                highlights: data.input.body.formats.highlights === true ? 1 : 0,
                json: data.input.body.formats.json === true ? 1 : 0,
                product: data.input.body.formats.product === true ? 1 : 0,
            },
        }),
        evidence: ({ data, utils }) => {
            const ok = ["highlights", "json", "product"].map((name) =>
                utils.json.optionalGet(
                    data.output,
                    "$." + name + ".success",
                ) ===
                    true
            );
            const passages = utils.json.optionalGet(
                data.output,
                "$.highlights.data",
            );
            return {
                counts: {
                    actions_surcharge: utils.json.optionalGet(
                            data.input.body ?? {},
                            "$.sharedParams.actions",
                        ) !== undefined
                        ? 1
                        : 0,
                    highlights: ok[0] && Array.isArray(passages) &&
                            passages.length > 0
                        ? 1
                        : 0,
                    json: ok[1] ? 1 : 0,
                    product: ok[2] ? 1 : 0,
                },
            };
        },
    },
});
