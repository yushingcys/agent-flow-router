import { defineEndpoint } from "@shared/core";
import { zSkuPathParams } from "../get-product/schema/inputs.ts";
import { zProductStoresQuery } from "./schema/inputs.ts";

/** GET /v1/products/{sku}/stores.json - in-store availability. */
export default defineEndpoint({
    meta: {
        displayName: "Get Product Store Availability",
        summary: "Best Buy stores near a ZIP code that have a SKU " +
            "available.",
        description:
            "List the Best Buy stores near a ZIP code where a SKU can be bought or picked up today, with " +
            "each store's address, distance and pickup eligibility.",
        docsUrl:
            "https://bestbuyapis.github.io/api-documentation/#in-store-availability",
        notes: [
            "A store absent from `stores` does not have the SKU available.",
        ],
    },
    endpoint: "/products/{sku}/stores",
    request: { method: "GET", path: "/products/{sku}/stores.json" },
    input: {
        schema: {
            pathParams: zSkuPathParams,
            queryParams: zProductStoresQuery,
        },
    },
});
