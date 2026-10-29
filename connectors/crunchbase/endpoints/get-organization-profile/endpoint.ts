import { defineEndpoint } from "@shared/core";
import { zEntityPathParams } from "../../schema/lookup.ts";
import { zLookupQueryParams } from "./schema/inputs.ts";

/** GET /v4/data/entities/organizations/{entity_id} */
export default defineEndpoint({
    meta: {
        displayName: "Get organization profile",
        summary:
            "An organization's profile: description, categories, location, funding, rank.",
        description:
            "Look up one Crunchbase organization by UUID or permalink and return its properties (name, short and full description, website, categories, headquarters, founded date, employee range, revenue range, funding total, last funding type, investor and IPO status, rank) and, optionally, relationship cards such as founders, raised_funding_rounds or investors.",
        docsUrl: "https://data.crunchbase.com/reference/getorganization-2",
        categories: ["company-enrichment"],
    },
    endpoint: "/get_organization_profile",
    request: { method: "GET", path: "/entities/organizations/{entity_id}" },
    input: {
        schema: {
            pathParams: zEntityPathParams,
            queryParams: zLookupQueryParams,
        },
    },
});
