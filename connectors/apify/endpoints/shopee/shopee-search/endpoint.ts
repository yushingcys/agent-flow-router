import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zShopeeSearchBody } from "./schema/inputs.ts";

/**
 * xtracto/shopee-search — Search Shopee by keyword.
 *
 * UNOFFICIAL third-party scraper of public Shopee sites. This is not
 * an official Shopee API. Shopee's terms may prohibit scraping, and the
 * actor can break without notice when the site changes.
 *
 * Pure data; the async machinery (lifecycle + fromError +
 * usage.evidence) is inherited leaf-wise from the apify provider.
 */
export default defineEndpoint({
    meta: {
        displayName: "Search Shopee",
        summary: "Search public Shopee listings by keyword, category, or URL.",
        description: "Unofficial scraper of public Shopee search and " +
            "category listings (not an official Shopee API). Keyword " +
            "search is the actor's default mode; a category slug or a " +
            "listing URL can be used instead. Returns product cards, " +
            "with optional detail enrichment that still bills one row " +
            "per product. Shopee's terms of service may prohibit " +
            "scraping, and results can stop without notice when the " +
            "site changes.",
        docsUrl: "https://apify.com/xtracto/shopee-search",
        categories: ["shopee"],
        notes: [
            "Unofficial third-party scraper, not an official Shopee API. " +
            "Terms-of-service and breakage risk: regional sites can " +
            "block the actor or change their pages, and a run can come " +
            "back empty.",
            "The actor-start event text bills once per GB of run memory " +
            "(default 4 GB). This card pins the published unit price, " +
            "which is what the drift check compares, so a default run's " +
            "start charge can be about 4× the pinned start line.",
            "fetchDetail enriches each card but does not add a charge " +
            "event — the published card is start plus one dataset row " +
            "per product.",
        ],
    },
    /** PUBLIC identity: the actor's own slug path (design D22) —
     *  mechanically derived from request.path, pinned for readability. */
    endpoint: "/xtracto/shopee-search",
    request: {
        method: "POST",
        path: "/v2/acts/xtracto~shopee-search/runs",
    },
    input: {
        schema: {
            // `maxProducts` is the primary limiting knob (1–500). WE
            // require it (inner int/min/max kept by .required) so the
            // hold is deducible (D25). `mode` is already actor-required.
            body: zShopeeSearchBody.required({ maxProducts: true }),
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
                    // startedAt 2026-07-15, surveyed 2026-11-27
                    consumes: { credit: "default", amount: 0.01 },
                },
                default_dataset_item: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    label: "products",
                    // vendor charge event: "apify-default-dataset-item"
                    // Business-tier (GOLD) price, same pricingInfo
                    consumes: { credit: "default", amount: 0.005 },
                },
            },
        },
        /** maxProducts when the mode's own input is present; a mode
         *  with its source missing estimates 0 (the actor stops). */
        estimate: ({ data }) => {
            const body = data.input.body;
            const keyword = body.keyword !== undefined && body.keyword !== "";
            const category = body.category !== undefined &&
                body.category !== "";
            const url = body.url !== undefined && body.url !== "";
            const active = body.mode === "keyword"
                ? keyword
                : body.mode === "category"
                ? category
                : url;
            return {
                counts: {
                    "default_dataset_item": active ? body.maxProducts : 0,
                },
            };
        },
    },
});
