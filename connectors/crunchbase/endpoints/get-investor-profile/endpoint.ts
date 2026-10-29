import { defineEndpoint } from "@shared/core";
import { zEntityPathParams } from "../../schema/lookup.ts";
import { zLookupQueryParams } from "./schema/inputs.ts";

/** GET /v4/data/entities/principals/{entity_id} */
export default defineEndpoint({
    meta: {
        displayName: "Get investor profile",
        summary:
            "An investor's profile: type, stage, portfolio size, exits, location.",
        description:
            "Look up one Crunchbase investor (organization or person principal) by UUID or permalink: investor type and stage, number of investments, lead investments, portfolio organizations and exits, funds, location, description and rank.",
        docsUrl: "https://data.crunchbase.com/reference/getprincipal-2",
        categories: ["funding-data"],
    },
    endpoint: "/get_investor_profile",
    request: { method: "GET", path: "/entities/principals/{entity_id}" },
    input: {
        schema: {
            pathParams: zEntityPathParams,
            queryParams: zLookupQueryParams,
        },
    },
});
