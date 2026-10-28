import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleScholarCaseLawQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_scholar_case_law */
export default defineEndpoint({
    meta: {
        displayName: "Read Court Opinion",
        summary:
            "Get the full text and citations of one Google Scholar court case.",
        description:
            "Get the full text and citations of one Google Scholar court case. Runs SerpApi's `google_scholar_case_law` engine. Requires `case_id`.",
        docsUrl: "https://serpapi.com/google-scholar-case-law-api",
        categories: ["legal-research"],
    },
    endpoint: "/google/scholar-case-law",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleScholarCaseLawQuery.extend({
                engine: zEngine("google_scholar_case_law"),
            }),
        },
    },
});
