import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleForumsQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_forums */
export default defineEndpoint({
    meta: {
        displayName: "Search Discussion Forums",
        summary:
            "Search forum and community discussions indexed by Google for a query.",
        description:
            "Search forum and community discussions indexed by Google for a query. Runs SerpApi's `google_forums` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/google-forums-api",
        categories: ["web-search"],
    },
    endpoint: "/google/forums",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleForumsQuery.extend({
                engine: zEngine("google_forums"),
            }),
        },
    },
});
