import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGooglePatentDetailsQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_patents_details */
export default defineEndpoint({
    meta: {
        displayName: "Get Patent Record",
        summary:
            "Get one patent's abstract, claims, parties, dates, and citations.",
        description:
            "Get one patent's abstract, claims, parties, dates, and citations. Runs SerpApi's `google_patents_details` engine. Requires `patent_id`.",
        docsUrl: "https://serpapi.com/google-patents-details-api",
        categories: ["academic-search"],
    },
    endpoint: "/google/patent-details",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGooglePatentDetailsQuery.extend({
                engine: zEngine("google_patents_details"),
            }),
        },
    },
});
