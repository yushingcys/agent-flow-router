import { defineEndpoint } from "@shared/core";
import { zGetProductQuery, zSkuPathParams } from "./schema/inputs.ts";

/** GET /v1/products/{sku}.json - one product by SKU. */
export default defineEndpoint({
    meta: {
        displayName: "Get Product",
        summary: "One Best Buy SKU's price, availability and details.",
        description: "Read one Best Buy product by SKU: name, model " +
            "number, UPC, regular and sale price, whether it is on sale, " +
            "online and in-store availability, orderable status, " +
            "shipping, and its product page URL.",
        docsUrl:
            "https://bestbuyapis.github.io/api-documentation/#products-api",
        notes: ["An unknown SKU is a 404."],
    },
    endpoint: "/products/{sku}",
    request: { method: "GET", path: "/products/{sku}.json" },
    input: {
        schema: { pathParams: zSkuPathParams, queryParams: zGetProductQuery },
    },
});
