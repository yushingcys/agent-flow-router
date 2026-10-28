import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zListGenerateBody } from "./schema/inputs.ts";

/** POST /v1/list/generate/companies - filter-built company lists. */
export default defineEndpoint({
    meta: {
        displayName: "Akta Company List Generation",
        summary: "Build a company list from structured filters.",
        description: "Build a targeted list of companies from structured " +
            "filters - company type, ownership, operating status, founded " +
            "year, HQ/office location and markets served, business model " +
            "(B2B/B2C, offering type, GTM motion, revenue model), revenue " +
            "and valuation bands, competitive moat, partnerships, named " +
            "customers, industry codes (Akta, NAICS, SIC), AI maturity and " +
            "API/app availability, and funding (stage, total raised, " +
            "rounds, investors). Results rank by relevance by default and " +
            "carry identity fields only (uuid, name, website, " +
            "product_category, company_type); enrich them with the other " +
            "Akta endpoints. Discover filter keys with Akta Filters List " +
            "and their allowed values with Akta Filter Options (both free).",
        docsUrl: "https://agent-docs.akta.pro/api-reference/listgen-api",
        categories: ["company-enrichment", "funding-data"],
    },
    request: { method: "POST", path: "/v1/list/generate/companies/" },
    // `limit` REQUIRED at the binding (design D25 - the mirror stays the
    // faithful vendor contract, optional there): it is the estimate's
    // whole basis, so the caller states it.
    input: { schema: { body: zListGenerateBody.required({ limit: true }) } },
    usage: {
        /** COMPOSITE (agent-tier pricing table): 1.5 credits base per call
         *  + 0.2 per company returned. */
        model: {
            kind: UsageModelKind.COMPOSITE,
            components: {
                request: {
                    kind: UsageModelKind.PER_CALL,
                    label: "base fee",
                    consumes: { credit: "default", amount: 1.5 },
                },
                company: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    label: "companies",
                    consumes: { credit: "default", amount: 0.2 },
                },
            },
        },
        estimate: ({ data }) => ({
            counts: { "company": data.input.body.limit },
        }),
        // Settle is INHERITED (design D27): the provider's generic evidence
        // counts companies DELIVERED (len($.data)).
    },
});
