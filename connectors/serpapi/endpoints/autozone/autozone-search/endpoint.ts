import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zAutozoneSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=autozone */
export default defineEndpoint({
    meta: {
        displayName: "Search AutoZone",
        summary: "Search AutoZone parts with prices and in-store pickup.",
        description:
            "Search AutoZone for parts, with part numbers, prices, ratings, and in-store pickup. Unofficial results via SerpApi's `autozone` engine, not an official AutoZone API. Requires q. Pass a product id from the results to autozone/product.",
        docsUrl: "https://serpapi.com/autozone-search-api",
        categories: ["autozone"],
        notes: [
            "vehicle_year, vehicle_make, and vehicle_model must be sent together. vehicle_engine, vehicle_submodel, and vehicle_type also require those three.",
        ],
    },
    endpoint: "/autozone/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zAutozoneSearchQuery.extend({
                engine: zEngine("autozone"),
            }),
        },
    },
});
