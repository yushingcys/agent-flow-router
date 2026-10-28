import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zDuckduckgoMapsQuery } from "./schema/inputs.ts";

/** GET /search?engine=duckduckgo_maps */
export default defineEndpoint({
    meta: {
        displayName: "Search Private Maps",
        summary: "Search DuckDuckGo Maps (Apple Maps data) for local places.",
        description:
            "Search DuckDuckGo Maps (Apple Maps data) for local places. Runs SerpApi's `duckduckgo_maps` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/duckduckgo-maps-api",
        categories: ["maps"],
    },
    endpoint: "/duckduckgo/maps",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zDuckduckgoMapsQuery.extend({
                engine: zEngine("duckduckgo_maps"),
            }),
        },
    },
});
