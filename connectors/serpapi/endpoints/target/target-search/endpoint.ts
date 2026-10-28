import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zTargetSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=target */
export default defineEndpoint({
    meta: {
        displayName: "Search Target Products",
        summary: "Search Target products with prices, deals, and availability.",
        description:
            "Search Target products with prices, deals, and availability. Runs SerpApi's `target` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/target-search-api",
        categories: ["web-search"],
    },
    endpoint: "/target/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zTargetSearchQuery.extend({
                engine: zEngine("target"),
            }),
        },
    },
});
