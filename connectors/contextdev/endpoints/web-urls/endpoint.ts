import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zWebUrlsQueryParams } from "./schema/inputs.ts";

export default defineEndpoint({
    meta: {
        displayName: "Map Site URLs",
        summary:
            "List a website's URLs with page titles and descriptions, optionally ranked by a topic.",
        description: "Discover the URLs on a website in one call - from " +
            "its sitemaps, or one sitemap you name - with each page's " +
            "title, description, keywords, and language when available. " +
            "Include subdomains, cap the count, keep or drop URLs by " +
            "regex, or pass a search phrase (matched across site " +
            "languages) to get the most relevant pages first. Use it to " +
            "pick the pages worth scraping before a scrape or crawl.",
        docsUrl: "https://docs.context.dev/api-reference/web-scraping/map",
        categories: ["web-extraction"],
        notes: [
            "A map with the 'search' filter costs 2 credits instead of 1.",
        ],
    },
    request: { method: "GET", path: "/web/urls" },
    input: { schema: { queryParams: zWebUrlsQueryParams } },
    usage: {
        /** 1 credit per call, 2 with `search` -
         *  https://docs.context.dev/account/credits (2026-10-27). The
         *  surcharge is its own line keyed from the REQUEST (design D5),
         *  as on web/scrape/sitemap. */
        model: {
            kind: UsageModelKind.COMPOSITE,
            components: {
                map: {
                    kind: UsageModelKind.PER_CALL,
                    label: "base fee",
                    consumes: { credit: "default", amount: 1 },
                },
                search_surcharge: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.CREDIT,
                    label: "search surcharge",
                    description: "the extra credit a search phrase adds",
                    consumes: { credit: "default", amount: 1 },
                },
            },
        },
        estimate: ({ data }) => ({
            counts: {
                search_surcharge: data.input.queryParams.search !== undefined
                    ? 1
                    : 0,
            },
        }),
        evidence: ({ data, utils }) => ({
            counts: {
                search_surcharge: utils.json.optionalGet(
                        data.input.queryParams ?? {},
                        "$.search",
                    ) !== undefined
                    ? 1
                    : 0,
            },
        }),
    },
});
