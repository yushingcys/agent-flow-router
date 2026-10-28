import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zFilterOptionsBody } from "./schema/inputs.ts";

/** POST /v1/filters/options - allowed values per list filter, free. */
export default defineEndpoint({
    meta: {
        displayName: "Akta Filter Options",
        summary: "Allowed values for list-generation filters - free.",
        description: "Get the allowed values (value + label) for one or " +
            "more Akta Company List Generation filters - countries, " +
            "regions, industry and NAICS/SIC codes, funding stages, " +
            "revenue and valuation bands, ownership, GTM motion, revenue " +
            "model, AI maturity, partnership types, investor uuids, and " +
            "more. Pass the 'dropdown_type' names from Akta Filters List; " +
            "the response data is keyed by them. Free - consumes 0 " +
            "credits.",
        docsUrl: "https://agent-docs.akta.pro/api-reference/filters-options",
        categories: ["company-enrichment"],
    },
    request: { method: "POST", path: "/v1/filters/options/" },
    input: { schema: { body: zFilterOptionsBody } },
    usage: { model: { kind: UsageModelKind.FREE } },
});
