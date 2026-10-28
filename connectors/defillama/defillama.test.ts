import { assert, assertEquals, assertRejects } from "@std/assert";
import { fromFileUrl } from "@std/path";
import {
    liveSkip,
    loadFixture,
    runEndpoint,
    testBundle,
    testSealedUnit,
} from "@shared/testing";

const fixtures = fromFileUrl(new URL("./fixtures/", import.meta.url));
const fixture = (name: string) => loadFixture(`${fixtures}${name}.json`);

Deno.test("defillama: 135 keyed Pro endpoints share one inject, 29 free ones send no key", async () => {
    const bundle = await testBundle();
    const docs = Object.values(bundle.endpoints).filter((d) =>
        d.provider === "defillama"
    );
    assertEquals(docs.length, 164);
    const free = docs.filter((d) => d.id.startsWith("defillama#free/"));
    const pro = docs.filter((d) => !d.id.startsWith("defillama#free/"));
    assertEquals(free.length, 29);

    const proInject = pro[0].auth.inject.$fn.key;
    for (const doc of pro) {
        assertEquals(doc.request.method, "GET", doc.id);
        assert(doc.request.url.startsWith("https://pro-api.llama.fi/"), doc.id);
        assertEquals(
            doc.request.url.slice("https://pro-api.llama.fi".length)
                .toLowerCase(),
            "/" + doc.id.slice("defillama#".length),
        );
        assertEquals(doc.auth.inject.$fn.key, proInject, doc.id);
        assertEquals(doc.usage.model.kind, "PER_CALL", doc.id);
    }
    const freeInject = free[0].auth.inject.$fn.key;
    assert(freeInject !== proInject);
    for (const doc of free) {
        assert(!doc.request.url.includes("pro-api"), doc.id);
        assert(doc.request.url.includes(".llama.fi/"), doc.id);
        assertEquals(doc.auth.inject.$fn.key, freeInject, doc.id);
        assertEquals(doc.usage.model.kind, "FREE", doc.id);
        assertEquals(Object.keys(doc.usage.credits), [], doc.id);
    }
});

Deno.test("defillama#api/protocols (synthetic): key spliced into the path, one call billed", async () => {
    const unit = await testSealedUnit("defillama#api/protocols");
    const result = await runEndpoint({
        unit,
        input: {},
        mode: "replay",
        fixture: await fixture("synthetic-protocols-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, {
        credits: { default: 1 },
        evidence: { CALL: 1 },
    });
    assertEquals((result.output as unknown[]).length, 2);
});

Deno.test("defillama#api/tvl/{protocol} (synthetic): path param after the key, bare-number body", async () => {
    const unit = await testSealedUnit("defillama#api/tvl/{protocol}");
    const result = await runEndpoint({
        unit,
        input: { pathParams: { protocol: "aave" } },
        mode: "replay",
        fixture: await fixture("synthetic-tvl-aave-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.output, 31234567890.12);
});

Deno.test("defillama#free/prices/current/{coins} (synthetic): keyless host, encoded coins, free", async () => {
    const unit = await testSealedUnit("defillama#free/prices/current/{coins}");
    const result = await runEndpoint({
        unit,
        input: {
            pathParams: {
                coins: "coingecko:ethereum," +
                    "ethereum:0xdac17f958d2ee523a2206206994597c13d831ec7",
            },
        },
        mode: "replay",
        fixture: await fixture("synthetic-free-prices-current-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    const coins = (result.output as { coins: Record<string, unknown> }).coins;
    assertEquals(Object.keys(coins).length, 2);
});

Deno.test("defillama#api/hacks (synthetic 402): plain-text error is data, zero usage", async () => {
    const unit = await testSealedUnit("defillama#api/hacks");
    const result = await runEndpoint({
        unit,
        input: {},
        mode: "replay",
        fixture: await fixture("synthetic-payment-required"),
    });
    assertEquals(result.httpStatus, 402);
    assertEquals(result.isProviderError, true);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals(
        (result.output as { message: string }).message,
        "This endpoint requires an active API plan.",
    );
});

Deno.test("defillama: camelCase vendor paths keep their case on the wire", async () => {
    const unit = await testSealedUnit("defillama#api/chainassets");
    assertEquals(
        unit.doc.request.url,
        "https://pro-api.llama.fi/api/chainAssets",
    );
});

Deno.test("defillama: spec bounds are enforced before the wire", async () => {
    const unit = await testSealedUnit("defillama#yields/v2/earn/query");
    await assertRejects(
        () =>
            runEndpoint({
                unit,
                input: { queryParams: { limit: 301 } },
                mode: "replay",
            }),
        Error,
        "INVALID_INPUT",
    );
    const block = await testSealedUnit(
        "defillama#coins/block/{chain}/{timestamp}",
    );
    await assertRejects(
        () =>
            runEndpoint({
                unit: block,
                input: {
                    pathParams: { chain: "ethereum", timestamp: "yesterday" },
                },
                mode: "replay",
            }),
        Error,
        "INVALID_INPUT",
    );
});

Deno.test({
    name: "defillama#free/v2/chains live (keyless)",
    ignore: Deno.env.get("DEFILLAMA_LIVE") !== "1",
    fn: async () => {
        const unit = await testSealedUnit("defillama#free/v2/chains");
        const result = await runEndpoint({ unit, input: {}, mode: "live" });
        assertEquals(result.isProviderError, false);
        assert((result.output as unknown[]).length > 10);
    },
});

Deno.test({
    name: "defillama#api/v2/chains live (gated on DEFILLAMA_API_KEY)",
    ignore: liveSkip("defillama"),
    fn: async () => {
        const unit = await testSealedUnit("defillama#api/v2/chains");
        const result = await runEndpoint({ unit, input: {}, mode: "live" });
        assertEquals(
            result.isProviderError,
            false,
            JSON.stringify(result.output),
        );
        assertEquals(result.usage.credits, { default: 1 });
    },
});
