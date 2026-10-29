import { defineEndpoint } from "@shared/core";
import { zEntitySearchBody } from "../../schema/search.ts";

/** POST /v4/data/searches/principals */
export default defineEndpoint({
    meta: {
        displayName: "Search investors",
        summary: "Search investors (firms and people) with field predicates.",
        description:
            "Search Crunchbase principals restricted to investors (the connector adds facet_ids includes 'investor'): venture firms, angels, corporate venture arms and other investors, filtered by investor type and stage, location, number of investments and exits, categories and rank, with the returned fields chosen per call. Returns `{count, entities: [{uuid, properties}]}`; page with after_id.",
        docsUrl: "https://data.crunchbase.com/reference/searchprincipals-2",
        categories: ["funding-data"],
        notes: [
            "Every query is narrowed to investors (facet_ids includes investor); an empty query lists all investors by the given order.",
        ],
    },
    endpoint: "/search_investors",
    request: { method: "POST", path: "/searches/principals" },
    input: {
        schema: { body: zEntitySearchBody },
        /** Narrow every principal search to investors. */
        toRequest: ({ data, utils }) => {
            const body = data.input.body ?? {};
            const query = utils.json.optionalGet(body, "$.query");
            return {
                ...data.input,
                body: utils.json.merge(body, {
                    query: [...(Array.isArray(query) ? query : []), {
                        type: "predicate",
                        field_id: "facet_ids",
                        operator_id: "includes",
                        values: ["investor"],
                    }],
                }),
            };
        },
    },
});
