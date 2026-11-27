import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zAutozoneProductQuery } from "./schema/inputs.ts";

/** GET /search?engine=autozone_product */
export default defineEndpoint({
    meta: {
        displayName: "Get AutoZone Product",
        summary: "Get an AutoZone part: price, specs, and store pickup.",
        description:
            "Get one AutoZone product by product_id, including title, price, specifications, and in-store pickup. Unofficial results via SerpApi's `autozone_product` engine, not an official AutoZone API.",
        docsUrl: "https://serpapi.com/autozone-product-api",
        categories: ["autozone"],
        notes: [
            "vehicle_token cannot be combined with vehicle_year, vehicle_make, vehicle_model, vehicle_engine, vehicle_submodel, or vehicle_type. The year, make, and model fields must be sent together.",
        ],
    },
    endpoint: "/autozone/product",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zAutozoneProductQuery.extend({
                engine: zEngine("autozone_product"),
            }),
        },
    },
});
