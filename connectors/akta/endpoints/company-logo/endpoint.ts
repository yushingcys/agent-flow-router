import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zCompanyPathParams } from "../../schema/common.ts";

/** GET /v1/company/enrichment/logo/{company} - hosted logo URL, free. */
export default defineEndpoint({
    meta: {
        displayName: "Akta Company Logo",
        summary: "A company's hosted logo URL - free.",
        description:
            "Fetch the hosted logo URL (PNG) for a company, plus its " +
            "Akta uuid. Free - consumes 0 credits.",
        docsUrl: "https://agent-docs.akta.pro/api-reference/company-data-logo",
        categories: ["company-enrichment"],
    },
    request: { method: "GET", path: "/v1/company/enrichment/logo/{company}" },
    input: { schema: { pathParams: zCompanyPathParams } },
    usage: {
        /** FREE - the vendor meter reports 0 (prunes to an empty claim). */
        model: { kind: UsageModelKind.FREE },
    },
});
