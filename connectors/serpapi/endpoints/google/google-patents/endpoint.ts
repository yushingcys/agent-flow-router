import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGooglePatentsQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_patents */
export default defineEndpoint({
    meta: {
        displayName: "Search Patent Filings",
        summary:
            "Search Google Patents for patents and applications by keyword or party.",
        description:
            "Search Google Patents for patents and applications by keyword or party. Runs SerpApi's `google_patents` engine.",
        docsUrl: "https://serpapi.com/google-patents-api",
        categories: ["academic-search"],
    },
    endpoint: "/google/patents",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGooglePatentsQuery.extend({
                engine: zEngine("google_patents"),
            }),
        },
    },
});
