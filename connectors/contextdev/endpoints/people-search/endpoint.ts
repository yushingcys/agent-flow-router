import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zPeopleSearchBody } from "./schema/inputs.ts";

export default defineEndpoint({
    meta: {
        displayName: "Search People",
        summary: "Find people with a natural-language query.",
        description: "Describe the people you want in plain words and get " +
            "a page of up to 10 matching profiles: name, headline, " +
            "profile URLs, location, current role with seniority, " +
            "function, start date and company, years of experience, " +
            "founder flag, skills, and schools. Filter by country and " +
            "years of experience, and page on with next_cursor. Suited " +
            "for prospecting, recruiting, and expert sourcing.",
        docsUrl: "https://docs.context.dev/api-reference/people/search",
        categories: ["people-enrichment"],
        notes: ["A search with no matches draws nothing."],
    },
    request: { method: "POST", path: "/people/search" },
    input: { schema: { body: zPeopleSearchBody } },
    usage: {
        /** 10 credits per NONEMPTY page -
         *  https://docs.context.dev/api-reference/people/search
         *  (2026-10-27: "Each nonempty page costs 10 credits, and searches
         *  with no matches are free"), so the count is the page that
         *  returned someone, not the call. */
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.PAGE,
            label: "result pages",
            description: "pages that returned at least one person",
            consumes: { credit: "default", amount: 10 },
        },
        estimate: () => ({ counts: { PAGE: 1 } }),
        evidence: ({ data, utils }) => ({
            counts: {
                PAGE: utils.json.len(data.output, "$.results") > 0 ? 1 : 0,
            },
        }),
    },
});
