import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zNaverSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=naver */
export default defineEndpoint({
    meta: {
        displayName: "Search Naver Web",
        summary:
            "Run a Naver search and get web, news, shopping, and place blocks.",
        description:
            "Run a Naver search and get web, news, shopping, and place blocks. Runs SerpApi's `naver` engine. Requires `query`.",
        docsUrl: "https://serpapi.com/naver-search-api",
        categories: ["web-search"],
    },
    endpoint: "/naver/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zNaverSearchQuery.extend({ engine: zEngine("naver") }),
        },
    },
});
