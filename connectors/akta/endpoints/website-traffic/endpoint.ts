import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zWebsiteTrafficQueryParams } from "./schema/inputs.ts";

/** GET /v1/company/website-traffic - visits, engagement, sources. */
export default defineEndpoint({
    meta: {
        displayName: "Akta Website Traffic",
        summary: "A company website's visits, engagement, and sources.",
        description: "Fetch a company's website traffic signals: " +
            "engagement metrics (bounce rate, pages per visit, time on " +
            "site), historical estimated monthly visits, and traffic share " +
            "by acquisition source (direct, search, social, referrals, " +
            "email, display, affiliate, generative AI).",
        docsUrl:
            "https://agent-docs.akta.pro/api-reference/alternative-data/website-traffic",
        categories: ["company-enrichment"],
    },
    request: { method: "GET", path: "/v1/company/website-traffic/" },
    input: { schema: { queryParams: zWebsiteTrafficQueryParams } },
    usage: {
        /** Flat 1.5 credits per call (agent-tier pricing table). */
        model: {
            kind: UsageModelKind.PER_CALL,
            consumes: { credit: "default", amount: 1.5 },
        },
    },
});
