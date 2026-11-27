import { defineEndpoint } from "@shared/core";
import {
    zSearchProductsPathParams,
    zSearchProductsQuery,
} from "./schema/inputs.ts";

/** GET /v1/products({filter}) - search the catalog. */
export default defineEndpoint({
    meta: {
        displayName: "Search Products",
        summary: "Search Best Buy products by keyword, UPC, model " +
            "number or any attribute.",
        description: "Find Best Buy products matching a query " +
            "expression: keywords across name, manufacturer, " +
            "descriptions and features, or exact attributes such as " +
            "upc, modelNumber, manufacturer, salePrice or " +
            "onlineAvailability. Returns a page of products with paging " +
            "totals; use `show` to get just the fields needed to compare " +
            "price and availability.",
        docsUrl:
            "https://bestbuyapis.github.io/api-documentation/#products-api",
        notes: [
            "Exact-match a product with filter upc=<UPC> or " +
            "modelNumber=<model>; keyword search may also return " +
            "accessories.",
        ],
    },
    endpoint: "/products/search",
    request: { method: "GET", path: "/products({filter})" },
    input: {
        schema: {
            pathParams: zSearchProductsPathParams,
            queryParams: zSearchProductsQuery,
        },
        /** JSON is the vendor's non-default format; callers never pick it. */
        toRequest: ({ data }) => ({
            ...data.input,
            queryParams: { ...data.input.queryParams, format: "json" },
        }),
    },
});
