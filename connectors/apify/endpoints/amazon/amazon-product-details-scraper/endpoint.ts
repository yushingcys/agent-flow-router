import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zAmazonProductDetailsScraperBody } from "./schema/inputs.ts";

/**
 * delicious_zebu/amazon-product-details-scraper — Get Amazon Product. Pure data; the async machinery
 * (lifecycle + fromError + usage.evidence + usage.consolidate) is
 * inherited leaf-wise from
 * the apify provider.
 */
export default defineEndpoint({
    meta: {
        displayName: "Get Amazon Product",
        summary: "Scrape full Amazon product detail pages by ASIN or " +
            "product URL.",
        description: "Scrapes Amazon product detail pages by ASIN or product " +
            "URL. Returns pricing, list prices, discounts, " +
            "availability, delivery estimates, star ratings, rating " +
            "distributions, review summaries, best-seller ranks, " +
            "category breadcrumbs, brand and seller info, titles, " +
            "descriptions, bullet features, specifications, and " +
            "image gallery URLs. Suited for market analysis, " +
            "competitor tracking, and data-driven decision-making.",
        // the actor's OWN page (v1 pointed at the unrelated junglee actor —
        // fixed in the 2026-09-16 reconcile; both URLs verified live)
        docsUrl:
            "https://apify.com/delicious_zebu/amazon-product-details-scraper",
        categories: ["amazon"],
        notes: [
            "There is no result-limit parameter - the number of results " +
            "(and the bill) equals the number of input queries.",
        ],
    },
    /** PUBLIC identity: the actor's own slug path (design D22) —
     *  mechanically derived from request.path, pinned for readability. */
    endpoint: "/delicious_zebu/amazon-product-details-scraper",
    request: {
        method: "POST",
        path: "/v2/acts/delicious_zebu~amazon-product-details-scraper/runs",
    },
    input: { schema: { body: zAmazonProductDetailsScraperBody } },
    usage: {
        model: {
            // the actor added the platform's flat start event to its card
            // (pricingInfo 2026-09-27): 1 GB default memory ⇒ the pinned
            // rate IS the per-run charge
            kind: UsageModelKind.COMPOSITE,
            components: {
                actor_start: {
                    kind: UsageModelKind.PER_CALL,
                    label: "actor start",
                    // vendor charge event: "apify-actor-start"
                    // Business-tier (GOLD) price, /v2/acts pricingInfo 2026-09-27
                    consumes: { credit: "default", amount: 0.00005 },
                },
                default_dataset_item: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    label: "products",
                    // vendor charge event: "apify-default-dataset-item"
                    // survey-pinned Business-tier event price
                    consumes: { credit: "default", amount: 0.0015 },
                },
            },
        },
        /** one result per Params entry (ASIN/URL, v1 ONE_PER_QUERY) — an
         *  empty batch promises 0 (deduced, design D25). */
        estimate: ({ data }) => ({
            counts: {
                "default_dataset_item": data.input.body.Params.length,
            },
        }),
    },
});
