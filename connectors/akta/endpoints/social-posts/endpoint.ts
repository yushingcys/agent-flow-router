import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zSocialPostsQueryParams } from "./schema/inputs.ts";

/** GET /v1/company/posts - a company's own social posts. */
export default defineEndpoint({
    meta: {
        displayName: "Akta Social Posts",
        summary: "A company's social posts with engagement metrics.",
        description: "Fetch the social media posts a company published " +
            "(LinkedIn and similar): content type, text, publish date, " +
            "URL, paid and repost flags, an AI-assigned classification, " +
            "mentions, and engagement metrics (reactions by type, " +
            "comments, reposts). Posts sit under data.posts; 'count' is " +
            "the total available. Paginate with limit/offset.",
        docsUrl:
            "https://agent-docs.akta.pro/api-reference/alternative-data/social-posts",
        categories: ["company-enrichment"],
        notes: [
            "Billed in whole 10-record increments of the requested 'limit' " +
            "(1 credit per started block of 10).",
        ],
    },
    request: { method: "GET", path: "/v1/company/posts/" },
    // `limit` REQUIRED at the binding (design D25 - the mirror stays the
    // faithful vendor contract, optional there): it is the estimate's
    // whole basis, so the caller states it.
    input: {
        schema: {
            queryParams: zSocialPostsQueryParams.required({ limit: true }),
        },
    },
    usage: {
        /** Posts are the quantity; the 10-record increment lives in
         *  `every` and the 1-credit draw in `consumes` (agent-tier pricing
         *  table: "1 credit for 10 records"). */
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.RESULT,
            label: "posts",
            every: 10,
            consumes: { credit: "default", amount: 1 },
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
