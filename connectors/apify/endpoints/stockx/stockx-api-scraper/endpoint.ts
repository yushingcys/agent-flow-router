import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zStockxApiScraperBody } from "./schema/inputs.ts";

/**
 * rl1987/stockx-api-scraper — Search StockX by keyword.
 *
 * UNOFFICIAL third-party scraper of the public StockX site. This is
 * not an official StockX API. StockX's terms may prohibit scraping,
 * and the actor can break without notice when the site changes.
 *
 * Pure data; lifecycle + fromError are inherited from the apify
 * provider. usage.evidence is local because the card has three
 * metered lines (design D29).
 */
export default defineEndpoint({
    meta: {
        displayName: "Search StockX",
        summary: "Search public StockX listings by keyword, with optional " +
            "detail and sales history.",
        description: "Unofficial scraper of public StockX resale data " +
            "(not an official StockX API). Keyword search returns one " +
            "row per product (lowest ask, highest bid, last sale, retail " +
            "price). Product-id lookup returns detail rows only. Sales " +
            "history returns one row per completed sale. StockX's terms " +
            "of service may prohibit scraping, and results can stop " +
            "without notice when the site changes.",
        docsUrl: "https://apify.com/rl1987/stockx-api-scraper",
        categories: ["stockx"],
        notes: [
            "Unofficial third-party scraper, not an official StockX API. " +
            "Terms-of-service and breakage risk: the site can block the " +
            "actor or change its pages, and a run can come back empty.",
            "Search bills plp-row per product, plus pdp-row when " +
            "includeDetails is on. Product lookup bills pdp-row only. " +
            "Sales history bills sales-history-row per sale. The actor's " +
            "own pricing table (readme, build 0.0.35).",
            "maxItems 0 means unlimited and is rejected here so the hold " +
            "is a number. maxPages 0 (the published default) means no " +
            "page cap; a page is about 40 products and has been measured " +
            "at 43, so a page cap is a floor. Price filters drop rows " +
            "before billing, so a maxItems estimate is a ceiling when " +
            "those filters are set.",
        ],
    },
    /** PUBLIC identity: the actor's own slug path (design D22) —
     *  mechanically derived from request.path, pinned for readability. */
    endpoint: "/rl1987/stockx-api-scraper",
    request: {
        method: "POST",
        path: "/v2/acts/rl1987~stockx-api-scraper/runs",
    },
    input: {
        schema: {
            // maxItems 0 = no limit (actor text). WE require it ≥1.
            // maxSalesPerProduct 0 = the whole history — floored to ≥1
            // at the actor's verified default of 100. mode /
            // includeDetails / maxPages take their verified defaults
            // (search / false / 0 = no page cap) so the estimate reads
            // them with no fallback constant (D25).
            body: zStockxApiScraperBody.required({ maxItems: true }).extend({
                maxItems: zStockxApiScraperBody.shape.maxItems.unwrap().min(1),
                mode: zStockxApiScraperBody.shape.mode.unwrap()
                    .default("search"),
                includeDetails: zStockxApiScraperBody.shape.includeDetails
                    .unwrap().default(false),
                maxPages: zStockxApiScraperBody.shape.maxPages.unwrap()
                    .default(0),
                maxSalesPerProduct: zStockxApiScraperBody.shape
                    .maxSalesPerProduct.unwrap().min(1).default(100),
            }),
        },
    },
    usage: {
        model: {
            kind: UsageModelKind.COMPOSITE,
            components: {
                plp_row: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    label: "search rows",
                    // vendor charge event: "plp-row"
                    // Business-tier (GOLD) price, pricingInfo startedAt
                    // 2026-10-30, surveyed 2026-11-27
                    consumes: { credit: "default", amount: 0.0025392 },
                },
                pdp_row: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    label: "detail rows",
                    // vendor charge event: "pdp-row"
                    consumes: { credit: "default", amount: 0.0012696 },
                },
                sales_history_row: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    label: "sales",
                    // vendor charge event: "sales-history-row"
                    consumes: { credit: "default", amount: 0.0012696 },
                },
            },
        },
        /** Search: maxItems products (tightened by maxPages × ~40) when
         *  a keyword or browse facet is set, plus the same count again
         *  on pdp-row when details are on. Product lookup: pdp-row only,
         *  capped by maxItems. Sales history: product ids (capped by
         *  maxItems) × maxSalesPerProduct. */
        estimate: ({ data }) => {
            const body = data.input.body;
            const ids = body.productIds?.length ?? 0;
            const products = Math.min(ids, body.maxItems);
            if (body.mode === "salesHistory") {
                return {
                    counts: {
                        "sales_history_row": products *
                            body.maxSalesPerProduct,
                    },
                };
            }
            if (body.mode === "product") {
                return { counts: { "pdp_row": products } };
            }
            const hasEntry = (body.q !== undefined && body.q !== "") ||
                body.category !== undefined ||
                (body.brand !== undefined && body.brand !== "") ||
                body.gender !== undefined ||
                (body.activity !== undefined && body.activity !== "");
            let rows = hasEntry ? body.maxItems : 0;
            if (body.maxPages > 0) {
                rows = Math.min(rows, body.maxPages * 40);
            }
            return {
                counts: {
                    "plp_row": rows,
                    ...(body.includeDetails ? { "pdp_row": rows } : {}),
                },
            };
        },
        /** Delivered rows bill the line the mode selects. The shared
         *  fixture's plain items carry no type field, so the mode on
         *  the input is the discriminator (actor readme, 2026-11-27). */
        evidence: ({ data }) => {
            const items = Array.isArray(data.output) ? data.output.length : 0;
            const body = data.input.body;
            if (body.mode === "salesHistory") {
                return { counts: { "sales_history_row": items } };
            }
            if (body.mode === "product") {
                return { counts: { "pdp_row": items } };
            }
            return {
                counts: {
                    "plp_row": items,
                    ...(body.includeDetails ? { "pdp_row": items } : {}),
                },
            };
        },
    },
});
