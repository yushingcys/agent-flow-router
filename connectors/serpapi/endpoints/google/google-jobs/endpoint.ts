import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleJobsQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_jobs */
export default defineEndpoint({
    meta: {
        displayName: "Search Job Listings",
        summary:
            "Search job postings aggregated by Google Jobs for a role and place.",
        description:
            "Search job postings aggregated by Google Jobs for a role and place. Runs SerpApi's `google_jobs` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/google-jobs-api",
        categories: ["jobs"],
    },
    endpoint: "/google/jobs",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleJobsQuery.extend({
                engine: zEngine("google_jobs"),
            }),
        },
    },
});
