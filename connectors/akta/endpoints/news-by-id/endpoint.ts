import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zNewsByIdQueryParams } from "./schema/inputs.ts";

/** GET /v1/news/by-id - full article records for known news ids. */
export default defineEndpoint({
    meta: {
        displayName: "Akta News Details",
        summary: "Full enriched article records for known news ids.",
        description: "Fetch the complete enriched record for one or more " +
            "news articles by id: AI summary, full article text, " +
            "sentiment, event tags, industry tags, named entities, " +
            "company mentions, and taxonomy codes (IPTC, IAB, NAICS, SIC). " +
            "Use it when you already have article ids from the Akta News " +
            "endpoint and need their full data.",
        docsUrl: "https://agent-docs.akta.pro/api-reference/news-detail",
        categories: ["company-news"],
    },
    request: { method: "GET", path: "/v1/news/by-id/" },
    input: { schema: { queryParams: zNewsByIdQueryParams } },
    usage: {
        /** COMPOSITE, the news shape: 0.1 credits flat + 0.01 per article
         *  (agent-tier pricing table, "News Details"). */
        model: {
            kind: UsageModelKind.COMPOSITE,
            components: {
                request: {
                    kind: UsageModelKind.PER_CALL,
                    label: "base fee",
                    consumes: { credit: "default", amount: 0.1 },
                },
                article: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.RESULT,
                    label: "articles",
                    consumes: { credit: "default", amount: 0.01 },
                },
            },
        },
        /** One article per requested id; the engine appends the flat
         *  `request: 1`. */
        estimate: ({ data }) => ({
            counts: { "article": data.input.queryParams.news_ids.length },
        }),
        // Settle is INHERITED (design D27): the provider's generic evidence
        // counts articles DELIVERED (len($.data)).
    },
});
