import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zSheinScraperBody } from "./schema/inputs.ts";

/**
 * axlymxp/Shein-scraper — Search Shein by keyword.
 *
 * UNOFFICIAL third-party scraper of public Shein storefronts. This is
 * not an official Shein API. Shein's terms may prohibit scraping, and
 * the actor can break without notice when the site changes.
 *
 * Pure data; the async machinery (lifecycle + fromError +
 * usage.evidence) is inherited leaf-wise from the apify provider.
 */
export default defineEndpoint({
    meta: {
        displayName: "Search Shein",
        summary: "Search a public Shein storefront by keyword.",
        description: "Unofficial scraper of public Shein product search " +
            "(not an official Shein API). One keyword (or a single " +
            "goods id) returns a page of products for a storefront the " +
            "actor supports. Shein's terms of service may prohibit " +
            "scraping, and results can stop without notice when the " +
            "site changes. Several storefronts, including the UK and " +
            "the EU, are rejected by the actor.",
        docsUrl: "https://apify.com/axlymxp/Shein-scraper",
        categories: ["shein"],
        notes: [
            "Unofficial third-party scraper, not an official Shein API. " +
            "Terms-of-service and breakage risk: Shein often blocks " +
            "automated reads, and the actor can break when the site " +
            "changes.",
            "limit is the product cap for the one page this input " +
            "scrapes (published range 1–100). The actor's default of " +
            "10 is not applied — the caller states the cap. Each " +
            "returned product is billed at the actor's dataset rate.",
        ],
    },
    /** PUBLIC identity: the actor's own slug path, lower-cased (endpoint
     *  paths are lowercase by schema). request.path keeps the Store
     *  slug's casing; Apify resolves it case-insensitively. */
    endpoint: "/axlymxp/shein-scraper",
    request: {
        method: "POST",
        path: "/v2/acts/axlymxp~Shein-scraper/runs",
    },
    input: {
        schema: {
            // `limit` is the primary limiting knob. WE require it
            // (inner int/min(1)/max(100) kept by .required) so the hold
            // is deducible (D25). `keywords` is already actor-required.
            // `page` selects which page; it does not multiply the count.
            body: zSheinScraperBody.required({ limit: true }),
        },
    },
    usage: {
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.RESULT,
            // vendor charge event: "apify-default-dataset-item"
            // published event price (no tier table), pricingInfo
            // startedAt 2026-11-13, surveyed 2026-11-27
            consumes: { credit: "default", amount: 0.05 },
        },
        /** limit products for the one keyword on the requested page. */
        estimate: ({ data }) => ({
            counts: { "RESULT": data.input.body.limit },
        }),
    },
});
