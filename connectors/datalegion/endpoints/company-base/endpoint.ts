import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { companyNotes, zCompanyEnrichBody } from "../../schema/company.ts";

/** POST /company/enrich billed as the Company Base product (provider docs). */
export default defineEndpoint({
    meta: {
        displayName: "Company Base",
        summary:
            "Company identification and standard firmographics from a domain, name, LinkedIn or ticker.",
        description:
            "Company Base enrichment: name, headline, description, domains, industry, company size, type, founding year, locations, tickers and social profiles. Excludes Premium workforce metrics. Use Company Premium for headcount, hiring, attrition, growth and tenure.",
        docsUrl:
            "https://www.datalegion.ai/docs/api-reference/company-enrichment",
        categories: ["company-enrichment"],
        notes: [
            ...companyNotes,
            "The API key's account must hold the Company Base product: the " +
            "response carries that account product's fields and draws " +
            "its credits.",
        ],
    },
    endpoint: "/company/enrich/base",
    request: { method: "POST", path: "/company/enrich" },
    input: { schema: { body: zCompanyEnrichBody } },
    usage: {
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.RESULT,
            label: "records returned",
            consumes: { credit: "company_base", amount: 1 },
        },
    },
});
