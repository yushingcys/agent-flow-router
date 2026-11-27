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

Deno.test("etsy: one active-listings search, x-api-key auth, per-call billing", async () => {
    const bundle = await testBundle();
    const ids = Object.keys(bundle.endpoints).filter((id) =>
        id.startsWith("etsy#")
    );
    assertEquals(ids, ["etsy#listings/active"]);
    const doc = bundle.endpoints["etsy#listings/active"];
    assertEquals(doc.request.method, "GET");
    assertEquals(
        doc.request.url,
        "https://openapi.etsy.com/v3/application/listings/active",
    );
    assertEquals(doc.usage.model.kind, "PER_CALL");
    assertEquals(doc.meta.categories, ["etsy"]);
    const inject = instantiate(
        bundle.fnTable[doc.auth.inject.$fn.key],
        doc.auth.inject,
        "etsy auth",
    ) as (ctx: Json) => Json;
    const request = { method: "GET", url: doc.request.url, headers: {} };
    assertEquals(
        inject({ data: { request, params: { apiKey: "keystring:secret" } } }),
        { ...request, headers: { "x-api-key": "keystring:secret" } },
    );
});

Deno.test("etsy#listings/active happy (synthetic): keyword search by price, one call billed", async () => {
    const unit = await testSealedUnit("etsy#listings/active");
    const result = await runEndpoint({
        unit,
        input: {
            queryParams: {
                limit: 2,
                keywords: "walnut desk organizer",
                sort_on: "price",
                sort_order: "asc",
            },
        },
        mode: "replay",
        fixture: await fixture("synthetic-active-listings-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, {
        credits: { default: 1 },
        evidence: { CALL: 1 },
    });
    const output = result.output as {
        count: number;
        results: { listing_id: number; price: { amount: number } }[];
    };
    assertEquals(output.count, 1);
    assertEquals(output.results[0].listing_id, 1000000001);
    assertEquals(output.results[0].price.amount, 4500);
});

Deno.test("etsy#listings/active provider error (synthetic 403): message lifted, zero usage", async () => {
    const unit = await testSealedUnit("etsy#listings/active");
    const result = await runEndpoint({
        unit,
        input: { queryParams: { keywords: "mug" } },
        mode: "replay",
        fixture: await fixture("synthetic-invalid-key"),
    });
    assertEquals(result.httpStatus, 403);
    assertEquals(result.isProviderError, true);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals(
        (result.output as { message: string }).message,
        "API key not found or not active, or incorrect shared secret for API key.",
    );
});

Deno.test("etsy#listings/active: vendor bounds and enums, strict keys", async () => {
    const unit = await testSealedUnit("etsy#listings/active");
    const synthetic = await fixture("synthetic-active-listings-ok");
    const rejected: Record<string, Json>[] = [
        { limit: 0 },
        { limit: 101 },
        { offset: -1 },
        { sort_on: "relevance" },
        { sort_order: "sideways" },
        { buyer_country: "USA" },
        { keywords: "mug", api_key: "k" },
    ];
    for (const queryParams of rejected) {
        await assertRejects(
            () =>
                runEndpoint({
                    unit,
                    input: { queryParams },
                    mode: "replay",
                    fixture: synthetic,
                }),
            Error,
            "INVALID_INPUT",
            JSON.stringify(queryParams),
        );
    }
});

Deno.test({
    name: "etsy#listings/active live (gated on ETSY_API_KEY)",
    ignore: liveSkip("etsy"),
    fn: async () => {
        const unit = await testSealedUnit("etsy#listings/active");
        const result = await runEndpoint({
            unit,
            input: {
                queryParams: { keywords: "walnut desk organizer", limit: 1 },
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
