import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleRelatedQuestionsQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_related_questions */
export default defineEndpoint({
    meta: {
        displayName: "Expand People Also Ask",
        summary:
            "Expand a People Also Ask question into its answer and next questions.",
        description:
            "Expand a People Also Ask question into its answer and next questions. Runs SerpApi's `google_related_questions` engine. Requires `next_page_token`.",
        docsUrl: "https://serpapi.com/google-related-questions-api",
        categories: ["web-search"],
    },
    endpoint: "/google/related-questions",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleRelatedQuestionsQuery.extend({
                engine: zEngine("google_related_questions"),
            }),
        },
    },
});
