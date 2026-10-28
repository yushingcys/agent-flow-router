import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zDuckduckgoLightSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=duckduckgo_light */
export default defineEndpoint({
    meta: {
        displayName: "Fast Private Search",
        summary:
            "Get fast, lightweight DuckDuckGo organic results for a query.",
        description:
            "Get fast, lightweight DuckDuckGo organic results for a query. Runs SerpApi's `duckduckgo_light` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/duckduckgo-light-api",
        categories: ["web-search"],
    },
    endpoint: "/duckduckgo/light-search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zDuckduckgoLightSearchQuery.extend({
                engine: zEngine("duckduckgo_light"),
            }),
        },
    },
});
