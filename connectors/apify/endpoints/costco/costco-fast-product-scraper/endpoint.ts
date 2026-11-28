import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zCostcoFastProductScraperBody } from "./schema/inputs.ts";

/**
 * e-commerce/costco-fast-product-scraper — Search Costco.com by keyword.
 *
 * UNOFFICIAL third-party scraper of the public costco.com site. This is
 * not an official Costco API. Costco's terms may prohibit scraping, and
 * the actor can break without notice when the site changes.
 *
 * Pure data; the async machinery (lifecycle + fromError +
 * usage.evidence) is inherited leaf-wise from the apify provider.
 */
export default defineEndpoint({
    meta: {
        displayName: "Search Costco",
        summary: "Search public Costco.com listings by keyword or URL.",
        description: "Unofficial scraper of public Costco.com listings " +
            "(not an official Costco API). Searches by one keyword or by " +
            "Costco product or category URLs and returns names, prices, " +
            "ratings, and stock. Costco's terms of service may prohibit " +
            "scraping, and results can stop without notice when the site " +
            "changes.",
        docsUrl: "https://apify.com/e-commerce/costco-fast-product-scraper",
        categories: ["costco"],
        notes: [
            "Unofficial third-party scraper, not an official Costco API. " +
            "Terms-of-service and breakage risk: the site can block the " +
            "actor or change its pages, and a run can come back empty.",
            "maxProductsPerUrl is the product cap per keyword and per " +
            "start URL. The actor publishes no server default — the " +
            "caller states the cap. A keyword counts as one source " +
            "alongside any startUrls.",
        ],
    },
    /** PUBLIC identity: the actor's own slug path (design D22) —
     *  mechanically derived from request.path, pinned for readability. */
    endpoint: "/e-commerce/costco-fast-product-scraper",
    request: {
        method: "POST",
        path: "/v2/acts/e-commerce~costco-fast-product-scraper/runs",
    },
    input: {
        schema: {
            // `maxProductsPerUrl` is the primary limiting knob. WE
            // require it (inner int/min(1) kept by .required) so the
            // hold is deducible (D25).
            body: zCostcoFastProductScraperBody.required({
                maxProductsPerUrl: true,
            }),
        },
    },
    usage: {
        model: {
            kind: UsageModelKind.COMPOSITE,
            components: {
                start: {
                    kind: UsageModelKind.PER_CALL,
                    label: "base fee",
                    // vendor charge event: "start"
                    // GOLD tier (Business), pricingInfo startedAt
                    // 2026-08-17, surveyed 2026-11-27. The event text is
                    // a flat run start, not a per-GB rate.
                    consumes: { credit: "default", amount: 0.00007 },
                },
                push_product: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    label: "products",
                    // vendor charge event: "push-product"
                    // GOLD tier, surveyed 2026-11-27
                    consumes: { credit: "default", amount: 0.0029 },
                },
            },
        },
        /** One maxProductsPerUrl-sized batch per keyword and per URL.
         *  An input with neither keyword nor startUrls estimates 0
         *  products (the start fee still bills). */
        estimate: ({ data }) => {
            const body = data.input.body;
            const sources = (body.keyword ? 1 : 0) +
                (body.startUrls?.length ?? 0);
            return {
                counts: { "push_product": sources * body.maxProductsPerUrl },
            };
        },
    },
});
