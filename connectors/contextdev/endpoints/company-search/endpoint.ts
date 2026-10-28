import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zCompanySearchBody } from "./schema/inputs.ts";

export default defineEndpoint({
    meta: {
        displayName: "Search Companies",
        summary: "Find companies with a natural-language query.",
        description: "Describe the companies you want in plain words and " +
            "get a page of up to 10 matches with name, domain, " +
            "description, organization type, operating status, stock " +
            "symbols, revenue range, industries, founding year, " +
            "headquarters, headcount, and funding history. Filter by " +
            "headquarters country and employee range, and page on with " +
            "next_cursor. Suited for account list building, market maps, " +
            "and lead generation.",
        docsUrl: "https://docs.context.dev/api-reference/company/search",
        categories: ["company-enrichment"],
    },
    request: { method: "POST", path: "/company/search" },
    input: { schema: { body: zCompanySearchBody } },
    usage: {
        /** 2 credits per page - https://docs.context.dev/api-reference/company/search
         *  (2026-10-27, "2 Credits"; a page holds up to 10 companies and
         *  there is no limit knob). Flat model, compiler-synthesized
         *  estimate/evidence; the provider consolidate lifts
         *  `key_metadata.credits_consumed`. */
        model: {
            kind: UsageModelKind.PER_CALL,
            label: "searches",
            consumes: { credit: "default", amount: 2 },
        },
    },
});
