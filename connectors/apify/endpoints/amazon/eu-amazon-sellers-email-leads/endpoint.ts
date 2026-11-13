import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zEuAmazonSellersEmailLeadsBody } from "./schema/inputs.ts";

/**
 * xmiso_scrapers/eu-amazon-sellers-email-leads — Find Amazon Sellers (EU). Pure data; the async machinery
 * (lifecycle + fromError + usage.evidence + usage.consolidate) is
 * inherited leaf-wise from
 * the apify provider.
 */
export default defineEndpoint({
    meta: {
        displayName: "Find Amazon Sellers (EU)",
        summary: "Extract Amazon seller business data and contact leads " +
            "across EU and US marketplaces.",
        description: "Extracts Amazon seller business data across EU and US " +
            "marketplaces by category and country, from a database " +
            "of 200K+ scraped sellers. Returns seller identity and " +
            "profile, legal and registration details, VAT and " +
            "company identifiers, contact emails and phone numbers, " +
            "physical addresses, associated product listings with " +
            "product identifiers, and time-windowed seller ratings " +
            "and review metrics (lifetime, 1-year, 3-months).",
        docsUrl:
            "https://apify.com/xmiso_scrapers/eu-amazon-sellers-email-leads",
        categories: ["amazon", "company-enrichment"],
    },
    /** PUBLIC identity: the actor's own slug path (design D22) —
     *  mechanically derived from request.path, pinned for readability. */
    endpoint: "/xmiso_scrapers/eu-amazon-sellers-email-leads",
    request: {
        method: "POST",
        path: "/v2/acts/xmiso_scrapers~eu-amazon-sellers-email-leads/runs",
    },
    input: {
        schema: {
            // `max_results` is the primary limiting knob (exact result
            // cap) — WE require it at the binding: the estimate must be
            // deducible to price the hold (D25)
            body: zEuAmazonSellersEmailLeadsBody.required({
                max_results: true,
            }),
        },
    },
    usage: {
        /** The card split into per-dataset rates (pricingInfo 2026-10-16):
         *  private_sellers_only bills the private-seller rate (the vendor's
         *  own input doc), seller_country "CN" routes to the cheaper
         *  chinese sellers dataset, everything else bills standard-result.
         *  Both cheaper-than-private routings are bounded by the standard
         *  rate, so an unguessable mix can never under-hold. */
        model: {
            kind: UsageModelKind.COMPOSITE,
            components: {
                standard_result: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    label: "results",
                    // vendor charge event: "standard-result" (was
                    // apify-default-dataset-item until the 2026-10-16 split)
                    consumes: { credit: "default", amount: 0.0079 },
                },
                private_seller_result: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    label: "private-seller results",
                    description: "per result when private_sellers_only " +
                        "selects the private sellers dataset",
                    // vendor charge event: "private-seller-result"
                    consumes: { credit: "default", amount: 0.0109 },
                },
                chinese_seller_result: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    label: "chinese-seller results",
                    description: 'per result when seller_country "CN" ' +
                        "routes to the chinese sellers dataset",
                    // vendor charge event: "chinese-seller-result"
                    consumes: { credit: "default", amount: 0.0029 },
                },
            },
        },
        /** max_results caps the run exactly (v1 LIMIT_IS_EXACT) —
         *  required at the binding, so the estimate is pure arithmetic
         *  (D25). The dataset the run bills is the input's own choice. */
        estimate: ({ data }) => {
            const body = data.input.body;
            const key = body.private_sellers_only === true
                ? "private_seller_result"
                : body.seller_country === "CN"
                ? "chinese_seller_result"
                : "standard_result";
            return { counts: { [key]: body.max_results } };
        },
        /** ≥2 metered lines ⇒ doc-level quantities: the billed dataset is
         *  the input's choice; the default-dataset rows are the count. */
        evidence: ({ data, utils }) => {
            const rows = Array.isArray(data.output) ? data.output.length : 0;
            const body = data.input.body ?? {};
            const key =
                utils.json.optionalGet(body, "$.private_sellers_only") ===
                        true
                    ? "private_seller_result"
                    : utils.json.optionalGet(body, "$.seller_country") === "CN"
                    ? "chinese_seller_result"
                    : "standard_result";
            return { counts: { [key]: rows } };
        },
    },
});
