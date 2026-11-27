import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zAdidasProductScraperBody } from "./schema/inputs.ts";

/**
 * moving_beacon-owner1/adidas-product-scraper — Search Adidas.com by keyword.
 *
 * UNOFFICIAL third-party scraper of public adidas.com catalogs. This is
 * not an official Adidas API. Adidas's terms may prohibit scraping, and
 * the actor can break without notice when the site changes.
 *
 * Pure data; the async machinery (lifecycle + fromError +
 * usage.evidence) is inherited leaf-wise from the apify provider.
 */
export default defineEndpoint({
    meta: {
        displayName: "Search Adidas",
        summary: "Search a public Adidas catalog by keyword.",
        description: "Unofficial scraper of public adidas.com regional " +
            "catalogs (not an official Adidas API). Searches by keyword " +
            "and returns titles, prices, sale status, ratings, colors, " +
            "images, and availability. Adidas's terms of service may " +
            "prohibit scraping, and results can stop without notice " +
            "when the site changes.",
        docsUrl:
            "https://apify.com/moving_beacon-owner1/adidas-product-scraper",
        categories: ["adidas"],
        notes: [
            "Unofficial third-party scraper, not an official Adidas API. " +
            "Terms-of-service and breakage risk: Adidas is bot-protected, " +
            "and the actor can break when the site changes.",
            "maxResults is the stored-product cap (1–500). The actor's " +
            "published default of 60 is not applied — the caller states " +
            "the cap. Every stored product is billed.",
        ],
    },
    /** PUBLIC identity: the actor's own slug path (design D22) —
     *  mechanically derived from request.path, pinned for readability. */
    endpoint: "/moving_beacon-owner1/adidas-product-scraper",
    request: {
        method: "POST",
        path: "/v2/acts/moving_beacon-owner1~adidas-product-scraper/runs",
    },
    input: {
        schema: {
            // `maxResults` is the primary limiting knob. WE require it
            // (inner int/min(1)/max(500) kept by .required) so the hold
            // is deducible (D25). `query` is already actor-required.
            body: zAdidasProductScraperBody.required({ maxResults: true }),
        },
    },
    usage: {
        model: {
            // verified actor-start charge event + per-item metering
            kind: UsageModelKind.COMPOSITE,
            components: {
                actor_start: {
                    kind: UsageModelKind.PER_CALL,
                    label: "base fee",
                    // vendor charge event: "apify-actor-start"
                    // published event price (no tier table), pricingInfo
                    // startedAt 2026-05-24, surveyed 2026-11-27.
                    // Default run memory is 1 GB, so the per-GB start
                    // text charges this unit price once.
                    consumes: { credit: "default", amount: 0.00005 },
                },
                default_dataset_item: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    label: "products",
                    // vendor charge event: "apify-default-dataset-item"
                    consumes: { credit: "default", amount: 0.01 },
                },
            },
        },
        /** One keyword search, capped at maxResults (required). */
        estimate: ({ data }) => ({
            counts: {
                "default_dataset_item": data.input.body.maxResults,
            },
        }),
    },
});
