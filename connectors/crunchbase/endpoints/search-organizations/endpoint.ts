import { defineEndpoint } from "@shared/core";
import { zEntitySearchBody } from "../../schema/search.ts";

/** POST /v4/data/searches/organizations */
export default defineEndpoint({
    meta: {
        displayName: "Search organizations",
        summary: "Search companies and organizations with field predicates.",
        description:
            "Search Crunchbase organizations with up to 25 field predicates (categories, headquarters location, founded date, funding total, last funding type and date, employee count, revenue range, operating status, rank) and choose the returned fields. Returns `{count, entities: [{uuid, properties}]}`; page with after_id. Use Get organization profile with a returned permalink for the full record.",
        docsUrl: "https://data.crunchbase.com/reference/searchorganizations-2",
        categories: ["company-enrichment"],
        notes: [
            "An exact name lookup is the predicate {field_id: 'identifier', operator_id: 'contains', values: ['stripe']}; categories and locations take UUIDs or permalinks.",
        ],
    },
    endpoint: "/search_organizations",
    request: { method: "POST", path: "/searches/organizations" },
    input: { schema: { body: zEntitySearchBody } },
});
