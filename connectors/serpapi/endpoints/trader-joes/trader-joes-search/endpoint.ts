import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zTraderJoesSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=trader_joes */
export default defineEndpoint({
    meta: {
        displayName: "Search Trader Joe's",
        summary: "Search Trader Joe's products with prices and sizes.",
        description:
            "Search Trader Joe's and get titles, prices, sizes, and categories. Unofficial structured results via SerpApi's trader_joes engine, not a Trader Joe's official API. Requires q. Pass a product_id from the results to trader-joes/product.",
        docsUrl: "https://serpapi.com/trader-joes-search-api",
        categories: ["trader-joes"],
        notes: [
            "Unofficial structured results from SerpApi, not the retailer's official API. The retailer's terms may prohibit scraping, and the engine can break when the site changes.",
        ],
    },
    endpoint: "/trader-joes/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zTraderJoesSearchQuery.extend({
                engine: zEngine("trader_joes"),
            }),
        },
    },
});
