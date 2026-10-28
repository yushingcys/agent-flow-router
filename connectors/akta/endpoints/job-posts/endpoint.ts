import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zJobPostsQueryParams } from "./schema/inputs.ts";

/** GET /v1/company/jobs - live LinkedIn and Indeed job listings. */
export default defineEndpoint({
    meta: {
        displayName: "Akta Job Posts",
        summary: "A company's live job listings and hiring signals.",
        description: "Fetch a company's live job listings sourced from " +
            "LinkedIn, Indeed, and others: title, location, posting date, " +
            "URL, AI-written description, employment type, remote flag, " +
            "disclosed salary range (USD), experience level, and extracted " +
            "key skills, plus the total number of open roles ('count'). " +
            "Paginate with limit/offset.",
        docsUrl:
            "https://agent-docs.akta.pro/api-reference/alternative-data/job-posts",
        categories: ["jobs"],
        notes: [
            "Billed in whole 10-record increments of the requested 'limit' " +
            "(4 credits per started block of 10).",
        ],
    },
    request: { method: "GET", path: "/v1/company/jobs/" },
    // `limit` REQUIRED at the binding (design D25 - the mirror stays the
    // faithful vendor contract, optional there): it is the estimate's
    // whole basis, so the caller states it.
    input: {
        schema: {
            queryParams: zJobPostsQueryParams.required({ limit: true }),
        },
    },
    usage: {
        /** Listings are the quantity; the 10-record increment lives in
         *  `every` and the 4-credit draw in `consumes` (agent-tier pricing
         *  table: "4 credits for 10 records"). */
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.RESULT,
            label: "job posts",
            every: 10,
            consumes: { credit: "default", amount: 4 },
        },
        estimate: ({ data }) => ({
            counts: { "RESULT": data.input.queryParams.limit },
        }),
        /** Requested-quantity basis, like employee-reviews (byte-identical
         *  source, so one fnTable entry): the vendor prices blocks of
         *  records requested, and the provider consolidate's claim
         *  cross-checks it on every real run. */
        evidence: ({ data, utils }) => ({
            counts: {
                "RESULT": utils.json.num(
                    data.input.queryParams ?? {},
                    "$.limit",
                ),
            },
        }),
    },
});
