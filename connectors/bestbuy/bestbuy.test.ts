import { assertEquals, assertRejects } from "@std/assert";
import type { Json } from "@shared/core";
import { fromFileUrl } from "@std/path";
import {
    liveSkip,
    loadFixture,
    runEndpoint,
    testBundle,
    testSealedUnit,
} from "@shared/testing";
import { instantiate } from "../../engine/link.ts";

const fixtures = fromFileUrl(new URL("./fixtures/", import.meta.url));
const fixture = (name: string) => loadFixture(`${fixtures}${name}.json`);

const SHOW_PRICE_AVAILABILITY =
    "sku,name,regularPrice,salePrice,onSale,onlineAvailability," +
    "inStoreAvailability,orderable";

Deno.test("bestbuy: search, SKU lookup and store availability, per-call billing", async () => {
    const bundle = await testBundle();
    const ids = Object.keys(bundle.endpoints).filter((id) =>
        id.startsWith("bestbuy#")
    ).sort();
    const urls: Record<string, string> = {
        "bestbuy#products/search":
            "https://api.bestbuy.com/v1/products({filter})",
        "bestbuy#products/{sku}":
            "https://api.bestbuy.com/v1/products/{sku}.json",
        "bestbuy#products/{sku}/stores":
            "https://api.bestbuy.com/v1/products/{sku}/stores.json",
    };
    assertEquals(ids, Object.keys(urls));
    const first = bundle.endpoints[ids[0]];
    for (const id of ids) {
        const doc = bundle.endpoints[id];
        assertEquals(doc.request.method, "GET", id);
        assertEquals(doc.request.url, urls[id], id);
        assertEquals(doc.usage.model.kind, "PER_CALL", id);
        assertEquals(doc.meta.categories, ["bestbuy"], id);
        assertEquals(doc.auth.inject.$fn.key, first.auth.inject.$fn.key, id);
    }
});

Deno.test("bestbuy: the key rides as the apiKey query parameter, never a header", async () => {
    const bundle = await testBundle();
    const ref = bundle.endpoints["bestbuy#products/{sku}"].auth.inject;
    const inject = instantiate(
        bundle.fnTable[ref.$fn.key],
        ref,
        "bestbuy auth",
    ) as (ctx: Json) => Json;
    const request = {
        method: "GET",
        url: "https://api.bestbuy.com/v1/products/1.json",
        headers: {},
        query: { show: ["sku"] },
    };
    assertEquals(
        inject({ data: { request, params: { apiKey: "k" } } }),
        { ...request, query: { show: ["sku"], apiKey: ["k"] } },
    );
});

Deno.test("bestbuy#products/search happy (synthetic): UPC filter in the path, JSON forced, one call billed", async () => {
    const unit = await testSealedUnit("bestbuy#products/search");
    const result = await runEndpoint({
        unit,
        input: {
            pathParams: { filter: "upc=190199246850" },
            queryParams: {
                show: "sku,name,modelNumber,upc,regularPrice,salePrice," +
                    "onlineAvailability,inStoreAvailability",
                pageSize: 2,
            },
        },
        mode: "replay",
        fixture: await fixture("synthetic-search-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, {
        credits: { default: 1 },
        evidence: { CALL: 1 },
    });
    const output = result.output as {
        total: number;
        products: { sku: number; salePrice: number }[];
    };
    assertEquals(output.total, 1);
    assertEquals(output.products[0].sku, 6418599);
    assertEquals(output.products[0].salePrice, 199.99);
});

Deno.test("bestbuy#products/{sku} happy (synthetic): price and availability of one SKU", async () => {
    const unit = await testSealedUnit("bestbuy#products/{sku}");
    const result = await runEndpoint({
        unit,
        input: {
            pathParams: { sku: "6418599" },
            queryParams: { show: SHOW_PRICE_AVAILABILITY },
        },
        mode: "replay",
        fixture: await fixture("synthetic-product-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage.credits, { default: 1 });
    const output = result.output as Record<string, Json>;
    assertEquals(output.salePrice, 199.99);
    assertEquals(output.onlineAvailability, true);
    assertEquals(output.orderable, "Available");
});

Deno.test("bestbuy#products/{sku}/stores happy (synthetic): stores near a ZIP", async () => {
    const unit = await testSealedUnit("bestbuy#products/{sku}/stores");
    const result = await runEndpoint({
        unit,
        input: {
            pathParams: { sku: "6418599" },
            queryParams: { postalCode: "55423" },
        },
        mode: "replay",
        fixture: await fixture("synthetic-stores-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage.credits, { default: 1 });
    const output = result.output as { stores: { storeID: string }[] };
    assertEquals(output.stores.map((store) => store.storeID), ["1000"]);
});

Deno.test("bestbuy#products/{sku} provider error (synthetic 403): message lifted, zero usage", async () => {
    const unit = await testSealedUnit("bestbuy#products/{sku}");
    const result = await runEndpoint({
        unit,
        input: { pathParams: { sku: "6418599" } },
        mode: "replay",
        fixture: await fixture("synthetic-invalid-key"),
    });
    assertEquals(result.httpStatus, 403);
    assertEquals(result.isProviderError, true);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals(
        (result.output as { message: string }).message,
        "We were unable to validate your API Key.",
    );
});

Deno.test("bestbuy: numeric SKU, bounded pageSize, strict keys", async () => {
    const product = await testSealedUnit("bestbuy#products/{sku}");
    const search = await testSealedUnit("bestbuy#products/search");
    const synthetic = await fixture("synthetic-product-ok");
    const cases: [typeof product, Record<string, Json>][] = [
        [product, { pathParams: { sku: "abc" } }],
        [product, { pathParams: { sku: "1" }, queryParams: { apiKey: "k" } }],
        [search, { pathParams: { filter: "" } }],
        [search, {
            pathParams: { filter: "search=tv" },
            queryParams: { pageSize: 101 },
        }],
        [search, {
            pathParams: { filter: "search=tv" },
            queryParams: { format: "xml" },
        }],
        [search, {
            pathParams: { filter: "search=tv" },
            queryParams: { facets: "manufacturer" },
        }],
    ];
    for (const [unit, input] of cases) {
        await assertRejects(
            () =>
                runEndpoint({
                    unit,
                    input,
                    mode: "replay",
                    fixture: synthetic,
                }),
            Error,
            "INVALID_INPUT",
            JSON.stringify(input),
        );
    }
});

Deno.test({
    name: "bestbuy#products/search live (gated on BESTBUY_API_KEY)",
    ignore: liveSkip("bestbuy"),
    fn: async () => {
        const unit = await testSealedUnit("bestbuy#products/search");
        const result = await runEndpoint({
            unit,
            input: {
                pathParams: { filter: "search=airpods" },
                queryParams: { show: "sku,name,salePrice", pageSize: 1 },
            },
            mode: "live",
        });
        assertEquals(
            result.isProviderError,
            false,
            JSON.stringify(result.output),
        );
        assertEquals(result.usage.credits, { default: 1 });
    },
});
