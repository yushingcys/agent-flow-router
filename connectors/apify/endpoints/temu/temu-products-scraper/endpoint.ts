import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zTemuProductsScraperBody } from "./schema/inputs.ts";
import { zTemuProductsScraperOutput } from "./schema/output.ts";

/**
 * crw/temu-products-scraper — Search Temu by keyword.
 *
 * UNOFFICIAL third-party scraper of the public Temu site. This is not
 * an official Temu API. Temu's terms may prohibit scraping, and the
 * actor can break without notice when the site changes.
 *
 * Pure data; the async machinery (lifecycle + fromError +
 * usage.evidence) is inherited leaf-wise from the apify provider.
 */
export default defineEndpoint({
    meta: {
        displayName: "Search Temu",
        summary: "Search public Temu listings by keyword.",
        description: "Unofficial scraper of public Temu search results " +
            "(not an official Temu API). One keyword returns prices, " +
            "discounts, ratings, sales counts, and images, with the " +
            "actor's sort options. The published schema currently " +
            "accepts the US region only. Temu's terms of service may " +
            "prohibit scraping, and results can stop without notice " +
            "when the site changes.",
        docsUrl: "https://apify.com/crw/temu-products-scraper",
        categories: ["temu"],
        notes: [
            "Unofficial third-party scraper, not an official Temu API. " +
            "Terms-of-service and breakage risk: the site can block the " +
            "actor or change its pages, and a run can come back empty.",
            "max_items is the product cap (published range 10–100). The " +
            "actor's default of 40 is not applied — the caller states " +
            "the cap. Every returned product is billed.",
        ],
    },
    /** PUBLIC identity: the actor's own slug path (design D22) —
     *  mechanically derived from request.path, pinned for readability. */
    endpoint: "/crw/temu-products-scraper",
    request: {
        method: "POST",
        path: "/v2/acts/crw~temu-products-scraper/runs",
    },
    input: {
        schema: {
            // `max_items` is the primary limiting knob. WE require it
            // (inner int/min(10)/max(100) kept by .required) so the hold
            // is deducible (D25). `keyword` is already actor-required.
            body: zTemuProductsScraperBody.required({ max_items: true }),
        },
    },
    // Published dataset-item schema (design D29): passthrough
    // DOCUMENTATION — non-strict, all-optional ("required" stripped).
    output: { schema: zTemuProductsScraperOutput },
    usage: {
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.RESULT,
            // vendor charge event: "apify-default-dataset-item"
            // published event price (no tier table), pricingInfo
            // startedAt 2026-04-26, surveyed 2026-11-27
            consumes: { credit: "default", amount: 0.01 },
        },
        /** max_items is the cap for the single keyword. */
        estimate: ({ data }) => ({
            counts: { "RESULT": data.input.body.max_items },
        }),
    },
});
