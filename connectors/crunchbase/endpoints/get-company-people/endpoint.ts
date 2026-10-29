import { defineEndpoint } from "@shared/core";
import { zCardQueryParams, zEntityPathParams } from "../../schema/lookup.ts";

/** GET /v4/data/entities/organizations/{entity_id}/cards/jobs */
export default defineEndpoint({
    meta: {
        displayName: "Get company people",
        summary:
            "An organization's current and past team: people and their job titles.",
        description:
            "Read the `jobs` card of a Crunchbase organization: the people who work or worked there with title, job type, start and end dates and whether the job is current. Paginate with after_id; card_field_ids picks the columns.",
        docsUrl: "https://data.crunchbase.com/reference/getorganizationcard-2",
        categories: ["company-enrichment", "people-enrichment"],
        notes: [
            "For founders only, Get organization profile with card_ids=founders is the narrower read.",
        ],
    },
    endpoint: "/get_company_people",
    request: {
        method: "GET",
        path: "/entities/organizations/{entity_id}/cards/jobs",
    },
    input: {
        schema: {
            pathParams: zEntityPathParams,
            queryParams: zCardQueryParams,
        },
    },
});
