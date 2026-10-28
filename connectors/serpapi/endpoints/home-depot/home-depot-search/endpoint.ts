import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zHomeDepotSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=home_depot */
export default defineEndpoint({
    meta: {
        displayName: "Search Home Depot",
        summary: "Search The Home Depot catalog with prices and availability.",
        description:
            "Search The Home Depot catalog with prices and availability. Runs SerpApi's `home_depot` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/home-depot-search-api",
        categories: ["homedepot"],
    },
    endpoint: "/home-depot/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zHomeDepotSearchQuery.extend({
                engine: zEngine("home_depot"),
            }),
        },
    },
});
