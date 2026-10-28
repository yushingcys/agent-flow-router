import { assert, assertAlmostEquals, assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";
import {
    estimateEndpoint,
    liveSkip,
    loadFixture,
    runEndpoint,
    testBundle,
    testSealedUnit,
} from "@shared/testing";

const fixtures = fromFileUrl(new URL("./fixtures/", import.meta.url));
const fixture = (name: string) => loadFixture(`${fixtures}${name}.json`);

Deno.test("browserbase: Monid's ids over the account API, one auth fn, dollars", async () => {
    const bundle = await testBundle();
    const urls = Object.fromEntries(
        Object.entries(bundle.endpoints)
            .filter(([id]) => id.startsWith("browserbase#"))
            .map(([id, doc]) => [id, doc.request.url]),
    );
    assertEquals(urls, {
        "browserbase#browser/session/create":
            "https://api.browserbase.com/v1/sessions",
        "browserbase#fetch": "https://api.browserbase.com/v1/fetch",
        "browserbase#search": "https://api.browserbase.com/v1/search",
    });
    const auth = bundle.endpoints["browserbase#fetch"].auth.inject.$fn.key;
    for (const id of Object.keys(urls)) {
        assertEquals(bundle.endpoints[id].auth.inject.$fn.key, auth, id);
        assertEquals(
            bundle.endpoints[id].usage.credits,
            { default: { label: "US dollars" } },
        );
    }
});

Deno.test("browserbase#fetch (synthetic): $0.01 per call", async () => {
    const unit = await testSealedUnit("browserbase#fetch");
    const result = await runEndpoint({
        unit,
        input: { body: { url: "https://example.com" } },
        mode: "replay",
        fixture: await fixture("synthetic-fetch-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, {
        credits: { default: 0.01 },
        evidence: { CALL: 1 },
    });
    assertEquals((result.output as { statusCode: number }).statusCode, 200);
});

Deno.test("browserbase#search (synthetic): $0.01 per call", async () => {
    const unit = await testSealedUnit("browserbase#search");
    const result = await runEndpoint({
        unit,
        input: { body: { query: "browserbase", numResults: 2 } },
        mode: "replay",
        fixture: await fixture("synthetic-search-ok"),
    });
    assertEquals(result.usage.credits, { default: 0.01 });
    assertEquals(
        (result.output as { results: unknown[] }).results.length,
        2,
    );
});

Deno.test("browserbase#browser/session/create: timeout required, prepaid at $0.01 + $0.002/min past 5", async () => {
    const unit = await testSealedUnit("browserbase#browser/session/create");
    const body = unit.doc.input.schema.body as {
        required?: string[];
        properties: Record<string, unknown>;
    };
    assert(body.required?.includes("timeout"));
    assert(!("proxies" in body.properties));

    const cost = async (timeout: number) =>
        (await estimateEndpoint(unit, { body: { timeout } })).credits.default;
    assertAlmostEquals(await cost(60), 0.01, 1e-9);
    assertAlmostEquals(await cost(300), 0.01, 1e-9);
    assertAlmostEquals(await cost(301), 0.012, 1e-9);
    // matches the gateway's quote: 30 minutes = $0.06, 2 hours = $0.24
    assertAlmostEquals(await cost(1800), 0.06, 1e-9);
    assertAlmostEquals(await cost(7200), 0.24, 1e-9);

    const result = await runEndpoint({
        unit,
        input: { body: { timeout: 1800 } },
        mode: "replay",
        fixture: await fixture("synthetic-session-created"),
    });
    assertEquals(result.httpStatus, 201);
    assertEquals(result.usage.evidence, { session: 1, extra_minute: 25 });
    assertAlmostEquals(result.usage.credits.default, 0.06, 1e-9);
    assert(
        (result.output as { connectUrl: string }).connectUrl.startsWith(
            "wss://",
        ),
    );
});

Deno.test("browserbase provider error (synthetic 401): message surfaced, zero usage", async () => {
    const unit = await testSealedUnit("browserbase#fetch");
    const result = await runEndpoint({
        unit,
        input: { body: { url: "https://example.com" } },
        mode: "replay",
        fixture: await fixture("synthetic-unauthorized"),
    });
    assertEquals(result.httpStatus, 401);
    assertEquals(result.isProviderError, true);
    assertEquals(result.usage, { credits: {}, evidence: {} });
});

Deno.test({
    name: "browserbase#fetch live (gated on BROWSERBASE_API_KEY)",
    ignore: liveSkip("browserbase"),
    fn: async () => {
        const unit = await testSealedUnit("browserbase#fetch");
        const result = await runEndpoint({
            unit,
            input: { body: { url: "https://example.com" } },
            mode: "live",
        });
        assertEquals(
            result.isProviderError,
            false,
            JSON.stringify(result.output),
        );
        assertEquals(result.usage.credits, { default: 0.01 });
    },
});
