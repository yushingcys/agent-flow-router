import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zNeweggProductScraperBody } from "./schema/inputs.ts";

/**
 * kawsar/newegg-product-scraper — Search Newegg by keyword.
 *
 * UNOFFICIAL third-party scraper of the public newegg.com site. This is
 * not an official Newegg API. Newegg's terms may prohibit scraping, and
 * the actor can break without notice when the site changes.
 *
 * Pure data; the async machinery (lifecycle + fromError +
 * usage.evidence) is inherited leaf-wise from the apify provider.
 */
export default defineEndpoint({
    meta: {
        displayName: "Search Newegg",
        summary: "Search public Newegg listings by keyword or URL.",
        description: "Unofficial scraper of public Newegg listings (not " +
            "an official Newegg API). Searches by keyword or by Newegg " +
            "search and product URLs and returns titles, prices, ratings, " +
            "and stock. Newegg's terms of service may prohibit scraping, " +
            "and results can stop without notice when the site changes.",
        docsUrl: "https://apify.com/kawsar/newegg-product-scraper",
        categories: ["newegg"],
        notes: [
            "Unofficial third-party scraper, not an official Newegg API. " +
            "Terms-of-service and breakage risk: the site can block the " +
            "actor or change its pages, and a run can come back empty.",
            "maxItems is the product cap for the whole run (published " +
            "default 100, which is not applied — the caller states the " +
            "cap). An input with neither keywords nor productUrls " +
            "estimates 0.",
        ],
    },
    /** PUBLIC identity: the actor's own slug path (design D22) —
     *  mechanically derived from request.path, pinned for readability. */
    endpoint: "/kawsar/newegg-product-scraper",
    request: {
        method: "POST",
        path: "/v2/acts/kawsar~newegg-product-scraper/runs",
    },
    input: {
        schema: {
            // `maxItems` is the primary limiting knob (products per run).
            // WE require it (inner int/min(1)/max(1000) kept by
            // .required) so the hold is deducible (D25).
            body: zNeweggProductScraperBody.required({ maxItems: true }),
        },
    },
    usage: {
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.RESULT,
            // vendor charge event: "apify-default-dataset-item"
            // GOLD tier (Business), pricingInfo startedAt 2026-04-28,
            // surveyed 2026-11-27
            consumes: { credit: "default", amount: 0.0029 },
        },
        /** The run cap when any keyword or URL is present. */
        estimate: ({ data }) => {
            const body = data.input.body;
            const sources = (body.keywords?.length ?? 0) +
                (body.productUrls?.length ?? 0);
            return { counts: { "RESULT": sources > 0 ? body.maxItems : 0 } };
        },
    },
});
