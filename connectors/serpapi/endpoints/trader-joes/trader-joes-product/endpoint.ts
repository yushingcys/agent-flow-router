import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zTraderJoesProductQuery } from "./schema/inputs.ts";

/** GET /search?engine=trader_joes_product */
export default defineEndpoint({
    meta: {
        displayName: "Get Trader Joe's Product",
        summary:
            "Get a Trader Joe's product page: price, ingredients, and nutrition.",
        description:
            "Get one Trader Joe's product by product_id, including price, availability, ingredients, and nutrition. Unofficial structured results via SerpApi's trader_joes_product engine, not a Trader Joe's official API.",
        docsUrl: "https://serpapi.com/trader-joes-product-api",
        categories: ["trader-joes"],
        notes: [
            "Unofficial structured results from SerpApi, not the retailer's official API. The retailer's terms may prohibit scraping, and the engine can break when the site changes.",
        ],
    },
    endpoint: "/trader-joes/product",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zTraderJoesProductQuery.extend({
                engine: zEngine("trader_joes_product"),
            }),
        },
    },
});
