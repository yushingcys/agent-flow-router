import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zHomeDepotProductQuery } from "./schema/inputs.ts";

/** GET /search?engine=home_depot_product */
export default defineEndpoint({
    meta: {
        displayName: "Get Home Depot Listing",
        summary: "Get one Home Depot product with price, specs, and UPC.",
        description:
            "Get one Home Depot product with price, specs, and UPC. Runs SerpApi's `home_depot_product` engine. Requires `product_id`.",
        docsUrl: "https://serpapi.com/home-depot-product",
        categories: ["homedepot"],
    },
    endpoint: "/home-depot/product",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zHomeDepotProductQuery.extend({
                engine: zEngine("home_depot_product"),
            }),
        },
    },
});
