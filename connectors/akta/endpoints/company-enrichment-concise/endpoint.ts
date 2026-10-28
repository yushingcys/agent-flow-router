import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zConciseQueryParams } from "./schema/inputs.ts";

/** GET /v1/company/enrichment/concise - every section, condensed, flat. */
export default defineEndpoint({
    meta: {
        displayName: "Akta Company Enrichment (Concise)",
        summary: "A condensed all-section company profile at a flat price.",
        description: "Enrich a company with a condensed profile across " +
            "every section in one call - firmographic, business_model, " +
            "company_assessment (market position, strengths, weaknesses, " +
            "moat, risks, peers), company_hierarchy, digital_presence, " +
            "financial_estimate, location, management_profile, " +
            "product_offering, strategic_signal, customer_profile, " +
            "industry, and technology - each pre-condensed to its most " +
            "useful fields. There is no 'sections' filter; every call " +
            "returns the full set. The response data is keyed by section.",
        docsUrl:
            "https://agent-docs.akta.pro/api-reference/company-data-concise",
        categories: ["company-enrichment"],
    },
    request: { method: "GET", path: "/v1/company/enrichment/concise/" },
    input: { schema: { queryParams: zConciseQueryParams } },
    usage: {
        /** Flat 3 credits per run (agent-tier pricing table). */
        model: {
            kind: UsageModelKind.PER_CALL,
            consumes: { credit: "default", amount: 3 },
        },
    },
});
