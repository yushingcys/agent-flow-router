import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zNapaSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=napa */
export default defineEndpoint({
    meta: {
        displayName: "Search NAPA",
        summary:
            "Search NAPA Auto Parts and get prices and store availability.",
        description:
            "Search NAPA Auto Parts and get part names, prices, and store availability. Unofficial structured results via SerpApi's napa engine, not a NAPA official API. Requires q.",
        docsUrl: "https://serpapi.com/napa-search-api",
        categories: ["napa"],
        notes: [
            "Unofficial structured results from SerpApi, not the retailer's official API. The retailer's terms may prohibit scraping, and the engine can break when the site changes.",
        ],
    },
    endpoint: "/napa/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zNapaSearchQuery.extend({
                engine: zEngine("napa"),
            }),
        },
    },
});
