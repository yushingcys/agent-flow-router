import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zMacysProductSearchBody } from "./schema/inputs.ts";

/**
 * pintostudio/macys-product-search — Search Macy's by keyword.
 *
 * UNOFFICIAL third-party scraper of public macys.com search results.
 * This is not an official Macy's API. Macy's terms may prohibit
 * scraping, and the actor can break without notice when the site changes.
 *
 * Pure data; the async machinery (lifecycle + fromError +
 * usage.evidence) is inherited leaf-wise from the apify provider.
 */
export default defineEndpoint({
    meta: {
        displayName: "Search Macy's",
        summary: "Search public Macy's results by keyword, one page at a time.",
        description: "Unofficial scraper of public Macy's search results " +
            "(not an official Macy's API). One keyword returns one page " +
            "of products, with the page size given as the actor's " +
            "perPage string. Macy's terms of service may prohibit " +
            "scraping, and results can stop without notice when the " +
            "site changes.",
        docsUrl: "https://apify.com/pintostudio/macys-product-search",
        categories: ["macys"],
        notes: [
            "Unofficial third-party scraper, not an official Macy's API. " +
            "Terms-of-service and breakage risk: the site can block the " +
            "actor or change its pages, and a run can come back empty.",
            "The actor publishes perPage as a string (its editor prefill " +
            'is "20", which is not a server default). The caller ' +
            "states that page size; the estimate is Number(perPage) for " +
            "the single page this input returns.",
            "The actor-start event text bills once per GB of run memory " +
            "(default 4 GB). This card pins the published unit price, " +
            "which is what the drift check compares, so a default run's " +
            "start charge can be about 4× the pinned start line.",
        ],
    },
    /** PUBLIC identity: the actor's own slug path (design D22) —
     *  mechanically derived from request.path, pinned for readability. */
    endpoint: "/pintostudio/macys-product-search",
    request: {
        method: "POST",
        path: "/v2/acts/pintostudio~macys-product-search/runs",
    },
    input: {
        schema: {
            // `perPage` is the only size knob, and the actor types it as
            // a string. WE require it so the hold is deducible (D25).
            // `query` is already actor-required. `page` selects which
            // page, it does not multiply the count.
            body: zMacysProductSearchBody.required({ perPage: true }),
        },
    },
    usage: {
        model: {
            kind: UsageModelKind.COMPOSITE,
            components: {
                actor_start: {
                    kind: UsageModelKind.PER_CALL,
                    label: "base fee",
                    // vendor charge event: "apify-actor-start"
                    // published event price (no tier table), pricingInfo
                    // startedAt 2026-09-01, surveyed 2026-11-27
                    consumes: { credit: "default", amount: 0.00005 },
                },
                default_dataset_item: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    label: "products",
                    // vendor charge event: "apify-default-dataset-item"
                    consumes: { credit: "default", amount: 0.0079 },
                },
            },
        },
        /** One page. perPage is the actor's page-size string. */
        estimate: ({ data }) => ({
            counts: {
                "default_dataset_item": Number(data.input.body.perPage),
            },
        }),
    },
});
