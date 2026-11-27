import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zNikeScraperBody } from "./schema/inputs.ts";

/**
 * fatihtahta/nike-scraper — Search Nike.com by keyword.
 *
 * UNOFFICIAL third-party scraper of the public nike.com site. This is
 * not an official Nike API. Nike's terms may prohibit scraping, and the
 * actor can break without notice when the site changes.
 *
 * Pure data; the async machinery (lifecycle + fromError +
 * usage.evidence) is inherited leaf-wise from the apify provider.
 */
export default defineEndpoint({
    meta: {
        displayName: "Search Nike",
        summary: "Search public Nike.com listings by keyword.",
        description: "Unofficial scraper of public Nike.com product " +
            "listings (not an official Nike API). Searches by keyword, " +
            "or by a Nike search, category, or product URL, and returns " +
            "names, SKUs, colorways, prices, promotions, images, and " +
            "badges. Nike's terms of service may prohibit scraping, and " +
            "results can stop without notice when the site changes.",
        docsUrl: "https://apify.com/fatihtahta/nike-scraper",
        categories: ["nike"],
        notes: [
            "Unofficial third-party scraper, not an official Nike API. " +
            "Terms-of-service and breakage risk: the site can block the " +
            "actor or change its pages, and a run can come back empty.",
            "limit is listings saved per query or URL (published minimum " +
            "10). The actor's own default of 50000 is not applied — the " +
            "caller states the cap. Every returned listing is billed.",
        ],
    },
    /** PUBLIC identity: the actor's own slug path (design D22) —
     *  mechanically derived from request.path, pinned for readability. */
    endpoint: "/fatihtahta/nike-scraper",
    request: {
        method: "POST",
        path: "/v2/acts/fatihtahta~nike-scraper/runs",
    },
    input: {
        schema: {
            // `limit` is the primary limiting knob (listings per query or
            // URL). The published default is 50000 — WE require the
            // caller to state the cap (inner int/min(10) kept by
            // .required) so the hold is deducible (D25).
            body: zNikeScraperBody.required({ limit: true }),
        },
    },
    usage: {
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.RESULT,
            // vendor charge event: "outputrecord"
            // published event price (no tier table), pricingInfo
            // startedAt 2026-04-15, surveyed 2026-11-27
            consumes: { credit: "default", amount: 0.001 },
        },
        /** One `limit`-sized batch per query and per URL. An input with
         *  neither queries nor startUrls estimates 0 (D25). */
        estimate: ({ data }) => {
            const body = data.input.body;
            const sources = (body.queries?.length ?? 0) +
                (body.startUrls?.length ?? 0);
            return { counts: { "RESULT": sources * body.limit } };
        },
    },
});
