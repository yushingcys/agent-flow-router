import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zMarkdownQueryParams } from "./schema/inputs.ts";

/** GET /v1/company/enrichment/markdown - enrichment as one Markdown doc. */
export default defineEndpoint({
    meta: {
        displayName: "Akta Company Enrichment (Markdown)",
        summary: "Selected company profile sections as one Markdown doc.",
        description: "The same company data as Akta Company Enrichment, " +
            "rendered as a single Markdown document (an H1 with the " +
            "company name, then an H2 and bulleted fields per section) " +
            "instead of nested JSON - ready to drop into a prompt or a " +
            "report. List the sections you want in the 'sections' filter " +
            "(required - billing is per section); 'sections_included' " +
            "reports what was rendered, in document order. funding_detail " +
            "and mna_and_investment are available at premium per-section " +
            "rates.",
        docsUrl:
            "https://agent-docs.akta.pro/api-reference/company-data-markdown",
        categories: ["company-enrichment", "funding-data"],
    },
    request: { method: "GET", path: "/v1/company/enrichment/markdown/" },
    // `sections` REQUIRED AT THE BINDING (design D24), as on
    // company-enrichment: the estimate is per-section arithmetic.
    input: {
        schema: {
            queryParams: zMarkdownQueryParams.required({ sections: true }),
        },
    },
    usage: {
        /** COMPOSITE, one component PER SECTION (the company-enrichment
         *  shape), priced from the AGENT-tier pricing table - which bills
         *  management_profile at 1 and industry at 0.5 credits. */
        model: {
            kind: UsageModelKind.COMPOSITE,
            components: {
                firmographic: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    consumes: { credit: "default", amount: 2 },
                },
                business_model: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    consumes: { credit: "default", amount: 2 },
                },
                company_assessment: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    consumes: { credit: "default", amount: 2 },
                },
                trust_signal: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    consumes: { credit: "default", amount: 0.5 },
                },
                company_hierarchy: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    consumes: { credit: "default", amount: 0.5 },
                },
                digital_presence: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    consumes: { credit: "default", amount: 0.5 },
                },
                financial_estimate: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    consumes: { credit: "default", amount: 0.5 },
                },
                location: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    consumes: { credit: "default", amount: 0.5 },
                },
                management_profile: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    consumes: { credit: "default", amount: 1 },
                },
                product_offering: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    consumes: { credit: "default", amount: 2 },
                },
                strategic_signal: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    consumes: { credit: "default", amount: 1.5 },
                },
                customer_profile: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    consumes: { credit: "default", amount: 1 },
                },
                industry: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    consumes: { credit: "default", amount: 0.5 },
                },
                technology: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    consumes: { credit: "default", amount: 2 },
                },
                funding_detail: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    description: "Premium-rate section (3 credits)",
                    consumes: { credit: "default", amount: 3 },
                },
                mna_and_investment: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    description: "Premium-rate section (5 credits)",
                    consumes: { credit: "default", amount: 5 },
                },
            },
        },
        estimate: ({ data }) => ({
            counts: Object.fromEntries(
                data.input.queryParams.sections
                    .map((section) => [section, 1]),
            ),
        }),
        /** OVERRIDES the provider's generic evidence (design D27): `data`
         *  is a Markdown STRING, so the delivered sections are read off
         *  `sections_included` - one count per rendered section. */
        evidence: ({ data, utils }) => {
            const included = utils.json.optionalGet(
                data.output,
                "$.sections_included",
            );
            const sections = Array.isArray(included)
                ? included.filter((section) => typeof section === "string")
                : [];
            return {
                counts: Object.fromEntries(
                    sections.map((section) => [section, 1]),
                ),
            };
        },
    },
});
