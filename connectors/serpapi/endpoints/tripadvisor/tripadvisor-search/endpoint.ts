import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zTripadvisorSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=tripadvisor */
export default defineEndpoint({
    meta: {
        displayName: "Search Travel Listings",
        summary: "Search Tripadvisor for hotels, restaurants, and attractions.",
        description:
            "Search Tripadvisor for hotels, restaurants, and attractions. Runs SerpApi's `tripadvisor` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/tripadvisor-search-api",
        categories: ["maps"],
    },
    endpoint: "/tripadvisor/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zTripadvisorSearchQuery.extend({
                engine: zEngine("tripadvisor"),
            }),
        },
    },
});
