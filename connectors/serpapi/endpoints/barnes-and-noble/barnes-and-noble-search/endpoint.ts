import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zBarnesAndNobleSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=barnes_and_noble */
export default defineEndpoint({
    meta: {
        displayName: "Search Barnes & Noble",
        summary:
            "Search Barnes & Noble for books and other products with prices.",
        description:
            "Search Barnes & Noble and get titles, prices, formats, and ISBNs. Unofficial structured results via SerpApi's barnes_and_noble engine, not a Barnes & Noble official API. Requires q.",
        docsUrl: "https://serpapi.com/barnes-and-noble-api",
        categories: ["barnes-and-noble"],
        notes: [
            "Unofficial structured results from SerpApi, not the retailer's official API. The retailer's terms may prohibit scraping, and the engine can break when the site changes.",
        ],
    },
    endpoint: "/barnes-and-noble/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zBarnesAndNobleSearchQuery.extend({
                engine: zEngine("barnes_and_noble"),
            }),
        },
    },
});
