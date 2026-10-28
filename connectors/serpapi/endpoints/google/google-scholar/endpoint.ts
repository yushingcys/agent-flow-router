import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleScholarQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_scholar */
export default defineEndpoint({
    meta: {
        displayName: "Search Scholarly Papers",
        summary: "Search Google Scholar for papers, citations, and authors.",
        description:
            "Search Google Scholar for papers, citations, and authors. Runs SerpApi's `google_scholar` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/google-scholar-api",
        categories: ["academic-search"],
    },
    endpoint: "/google/scholar",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleScholarQuery.extend({
                engine: zEngine("google_scholar"),
            }),
        },
    },
});
