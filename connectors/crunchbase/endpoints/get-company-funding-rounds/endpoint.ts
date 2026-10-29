import { defineEndpoint } from "@shared/core";
import { zCardQueryParams, zEntityPathParams } from "../../schema/lookup.ts";

/** GET /v4/data/entities/organizations/{entity_id}/cards/raised_funding_rounds */
export default defineEndpoint({
    meta: {
        displayName: "Get company funding rounds",
        summary:
            "The funding rounds an organization raised: type, date, amount, lead investors.",
        description:
            "Read the `raised_funding_rounds` card of a Crunchbase organization: each round with its investment type (seed, series A ...), announced date, money raised, post-money valuation where known, number of investors and lead investors. Paginate with after_id; card_field_ids picks the columns.",
        docsUrl: "https://data.crunchbase.com/reference/getorganizationcard-2",
        categories: ["funding-data"],
    },
    endpoint: "/get_company_funding_rounds",
    request: {
        method: "GET",
        path: "/entities/organizations/{entity_id}/cards/raised_funding_rounds",
    },
    input: {
        schema: {
            pathParams: zEntityPathParams,
            queryParams: zCardQueryParams,
        },
    },
});
