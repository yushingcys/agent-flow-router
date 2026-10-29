import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { companyNotes, zCompanyEnrichBody } from "../../schema/company.ts";

/** POST /company/enrich billed as the Company Premium product (provider docs). */
export default defineEndpoint({
    meta: {
        displayName: "Company Premium",
        summary:
            "Company firmographics plus headcount, hiring, attrition, growth and tenure metrics.",
        description:
            "Company Premium enrichment: every Base firmographic plus workforce analytics - headcount and its monthly history, new hires, attrition, growth and turnover rates, tenure, and seniority / job-function / education distributions and growth, LinkedIn audience and employee counts, and freshness indicators. Use Company Base when standard firmographics suffice.",
        docsUrl:
            "https://www.datalegion.ai/docs/api-reference/company-enrichment",
        categories: ["company-enrichment"],
        notes: [
            ...companyNotes,
            "The API key's account must hold the Company Premium product: the " +
            "response carries that account product's fields and draws " +
            "its credits.",
        ],
    },
    endpoint: "/company/enrich/premium",
    request: { method: "POST", path: "/company/enrich" },
    input: { schema: { body: zCompanyEnrichBody } },
    usage: {
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.RESULT,
            label: "records returned",
            consumes: { credit: "company_premium", amount: 1 },
        },
    },
});
