import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleScholarAuthorQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_scholar_author */
export default defineEndpoint({
    meta: {
        displayName: "Get Researcher Profile",
        summary:
            "Get a Google Scholar author profile with articles and citation metrics.",
        description:
            "Get a Google Scholar author profile with articles and citation metrics. Runs SerpApi's `google_scholar_author` engine. Requires `author_id`.",
        docsUrl: "https://serpapi.com/google-scholar-author-api",
        categories: ["academic-search"],
    },
    endpoint: "/google/scholar-author",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleScholarAuthorQuery.extend({
                engine: zEngine("google_scholar_author"),
            }),
        },
    },
});
