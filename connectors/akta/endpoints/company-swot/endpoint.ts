import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zCompanyPathParams } from "../../schema/common.ts";

/** GET /v1/company/enrichment/swot/{company} - strengths, weaknesses, risks, highlights. */
export default defineEndpoint({
    meta: {
        displayName: "Akta Company SWOT",
        summary:
            "A company's strengths, weaknesses, key risks, and highlights.",
        description:
            "Fetch a SWOT-style assessment of a company derived from " +
            "its company assessment: strengths, weaknesses, key risks, and " +
            "key highlights, each with a headline, details, and source " +
            "links.",
        docsUrl: "https://agent-docs.akta.pro/api-reference/company-data-swot",
        categories: ["company-enrichment"],
    },
    request: { method: "GET", path: "/v1/company/enrichment/swot/{company}" },
    input: { schema: { pathParams: zCompanyPathParams } },
    usage: {
        /** Flat 0.5 credits per call (agent-tier pricing table). */
        model: {
            kind: UsageModelKind.PER_CALL,
            consumes: { credit: "default", amount: 0.5 },
        },
    },
});
