import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zCompanyPathParams } from "../../schema/common.ts";

/** GET /v1/company/enrichment/partnerships/{company} - partnership list. */
export default defineEndpoint({
    meta: {
        displayName: "Akta Company Partnerships",
        summary: "A company's partners and strategic relationships.",
        description: "Fetch the full partnership and strategic-relationship " +
            "list for a company: partner name and Akta uuid, partnership " +
            "type (technology_integration, strategic_codevelopment, " +
            "channel_reseller_distributor, ...), strategic tier (Core, " +
            "Minor), description, announcement date, and source links.",
        docsUrl:
            "https://agent-docs.akta.pro/api-reference/company-data-partnerships",
        categories: ["company-enrichment"],
    },
    request: {
        method: "GET",
        path: "/v1/company/enrichment/partnerships/{company}",
    },
    input: { schema: { pathParams: zCompanyPathParams } },
    usage: {
        /** Flat 0.5 credits per call (agent-tier pricing table). */
        model: {
            kind: UsageModelKind.PER_CALL,
            consumes: { credit: "default", amount: 0.5 },
        },
    },
});
