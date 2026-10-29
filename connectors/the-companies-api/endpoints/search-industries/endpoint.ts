import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zSearchIndustriesQueryParams } from "./schema/inputs.ts";

/** GET /v2/industries - free industry taxonomy search. */
export default defineEndpoint({
    meta: {
        displayName: "Search industries",
        summary:
            "Search the industry taxonomy and get each industry's company count.",
        description: "Search The Companies API industry database (3M+ " +
            "industries, sorted by company count) by keyword. Returns each " +
            "industry's name, slug and number of companies, with pagination " +
            "meta. Use the slugs as `about.industries` values in Search " +
            "companies and Count companies conditions.",
        docsUrl: "https://www.thecompaniesapi.com/api/search-industries",
        notes: ["Free: no credits are drawn."],
    },
    endpoint: "/search_industries",
    request: { method: "GET", path: "/v2/industries" },
    input: { schema: { queryParams: zSearchIndustriesQueryParams } },
    usage: { model: { kind: UsageModelKind.FREE } },
});
