import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zNordstromProductBulkScraperProBody } from "./schema/inputs.ts";
import { zNordstromProductBulkScraperProOutput } from "./schema/output.ts";

/**
 * hello.datawizards/nordstrom-product-bulk-scraper-pro — Search Nordstrom
 * by keyword.
 *
 * UNOFFICIAL third-party scraper of the public nordstrom.com site. This
 * is not an official Nordstrom API. Nordstrom's terms may prohibit
 * scraping, and the actor can break without notice when the site changes.
 *
 * Pure data; the async machinery (lifecycle + fromError +
 * usage.evidence) is inherited leaf-wise from the apify provider.
 */
export default defineEndpoint({
    meta: {
        displayName: "Search Nordstrom",
        summary: "Search public Nordstrom listings by keyword.",
        description: "Unofficial scraper of public Nordstrom search " +
            "results (not an official Nordstrom API). Each keyword " +
            "returns up to itemLimit products, with name, brand, price, " +
            "rating, and stock fields. Nordstrom's terms of service may " +
            "prohibit scraping, and results can stop without notice " +
            "when the site changes.",
        docsUrl:
            "https://apify.com/hello.datawizards/nordstrom-product-bulk-scraper-pro",
        categories: ["nordstrom"],
        notes: [
            "Unofficial third-party scraper, not an official Nordstrom " +
            "API. Terms-of-service and breakage risk: the site can " +
            "block the actor or change its pages, and a run can come " +
            "back empty.",
            "The actor's readme defines itemLimit as products retrieved " +
            "per query. An empty queries array estimates 0.",
            "The actor-start event text bills once per GB of run memory " +
            "(default 4 GB). This card pins the published unit price, " +
            "which is what the drift check compares, so a default run's " +
            "start charge can be about 4× the pinned start line.",
        ],
    },
    /** PUBLIC identity: the actor's own slug path (design D22) —
     *  mechanically derived from request.path, pinned for readability. */
    endpoint: "/hello.datawizards/nordstrom-product-bulk-scraper-pro",
    request: {
        method: "POST",
        path:
            "/v2/acts/hello.datawizards~nordstrom-product-bulk-scraper-pro/runs",
    },
    input: {
        schema: {
            // `itemLimit` is the primary limiting knob (per query, per
            // the actor readme). WE require it so the hold is deducible
            // (D25). The published default of 10 is not applied.
            // `queries` is already actor-required.
            body: zNordstromProductBulkScraperProBody.required({
                itemLimit: true,
            }),
        },
    },
    // Published dataset-item schema (design D29): passthrough
    // DOCUMENTATION — non-strict, all-optional ("required" stripped).
    output: { schema: zNordstromProductBulkScraperProOutput },
    usage: {
        model: {
            kind: UsageModelKind.COMPOSITE,
            components: {
                actor_start: {
                    kind: UsageModelKind.PER_CALL,
                    label: "base fee",
                    // vendor charge event: "apify-actor-start"
                    // published event price (no tier table), pricingInfo
                    // startedAt 2026-03-28, surveyed 2026-11-27
                    consumes: { credit: "default", amount: 0.005 },
                },
                default_dataset_item: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    label: "products",
                    // vendor charge event: "apify-default-dataset-item"
                    consumes: { credit: "default", amount: 0.005 },
                },
            },
        },
        /** itemLimit per query. No queries ⇒ 0 products. */
        estimate: ({ data }) => {
            const body = data.input.body;
            const queries = body.queries.length;
            return {
                counts: {
                    "default_dataset_item": queries === 0
                        ? 0
                        : queries * body.itemLimit,
                },
            };
        },
    },
});
