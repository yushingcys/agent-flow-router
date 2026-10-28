import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zHeadcountTrendsQueryParams } from "./schema/inputs.ts";

/** GET /v1/company/headcount-trends - LinkedIn-sourced workforce data. */
export default defineEndpoint({
    meta: {
        displayName: "Akta Headcount Trends",
        summary: "A company's headcount, growth, and department breakdown.",
        description: "Fetch a company's LinkedIn-sourced headcount data: " +
            "total employees, monthly historical headcount, 6/12/24-month " +
            "growth rates, and a headcount breakdown by function " +
            "(department) with its own growth.",
        docsUrl:
            "https://agent-docs.akta.pro/api-reference/alternative-data/headcount-trends",
        categories: ["company-enrichment"],
    },
    request: { method: "GET", path: "/v1/company/headcount-trends/" },
    input: { schema: { queryParams: zHeadcountTrendsQueryParams } },
    usage: {
        /** Flat 2.5 credits per call (agent-tier pricing table). */
        model: {
            kind: UsageModelKind.PER_CALL,
            consumes: { credit: "default", amount: 2.5 },
        },
    },
});
