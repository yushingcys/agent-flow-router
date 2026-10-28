import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=google */
export default defineEndpoint({
    meta: {
        displayName: "Search the Web",
        summary:
            "Run a Google search and get every parsed results-page element as JSON.",
        description:
            "Run a Google search and get every parsed results-page element as JSON. Runs SerpApi's `google` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/search-api",
        categories: ["web-search"],
    },
    endpoint: "/google/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleSearchQuery.extend({
                engine: zEngine("google"),
            }),
        },
    },
});
