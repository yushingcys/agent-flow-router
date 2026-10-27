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

Deno.test("tavily: four endpoints, one auth fn, one credit pool, search alone consolidates", async () => {
    const bundle = await testBundle();
    const ids = Object.keys(bundle.endpoints).filter((id) =>
        id.startsWith("tavily#")
    ).sort();
    assertEquals(ids, [
        "tavily#crawl",
        "tavily#extract",
        "tavily#map",
        "tavily#search",
    ]);
    const auth = bundle.endpoints["tavily#search"].auth.inject.$fn.key;
    for (const id of ids) {
        const doc = bundle.endpoints[id];
        assertEquals(doc.request.method, "POST", id);
        assertEquals(
            doc.request.url,
            `https://api.tavily.com/${id.slice("tavily#".length)}`,
        );
        assertEquals(doc.auth.inject.$fn.key, auth, id);
        assertEquals(Object.keys(doc.usage.credits), ["default"], id);
        assertEquals(
            doc.usage.consolidate !== undefined,
            id === "tavily#search",
            id,
        );
    }
});

Deno.test("tavily#search happy (synthetic): vendor claim agrees with the fold, usage plucked", async () => {
    const unit = await testSealedUnit("tavily#search");
    const result = await runEndpoint({
        unit,
        input: { body: { query: "deno workspace monorepo", max_results: 2 } },
        mode: "replay",
        fixture: await fixture("synthetic-search-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, {
        credits: { default: 1 },
        evidence: { CREDIT: 1 },
    });
    const output = result.output as Record<string, unknown>;
    assertEquals("usage" in output, false);
    assertEquals((output.results as unknown[]).length, 2);
});

Deno.test("tavily#search: include_usage is forced on and not caller-facing", async () => {
    const unit = await testSealedUnit("tavily#search");
    const properties = unit.doc.input.schema.body?.properties as Record<
        string,
        unknown
    >;
    assert(!("include_usage" in properties));
    assert("search_depth" in properties);
});

Deno.test("tavily#search: advanced and auto_parameters hold 2 credits; auto settles from the echoed depth", async () => {
    const unit = await testSealedUnit("tavily#search");
    const estimate = (body: Record<string, unknown>) =>
        estimateEndpoint(unit, { body: { query: "x", ...body } });
    assertEquals((await estimate({})).credits, { default: 1 });
    assertEquals((await estimate({ search_depth: "advanced" })).credits, {
        default: 2,
    });
    assertEquals((await estimate({ auto_parameters: true })).credits, {
        default: 2,
    });
    assertEquals(
        (await estimate({ auto_parameters: true, search_depth: "basic" }))
            .credits,
        { default: 1 },
    );

    const result = await runEndpoint({
        unit,
        input: {
            body: {
                query: "latest solid-state battery research",
                auto_parameters: true,
            },
        },
        mode: "replay",
        fixture: await fixture("synthetic-search-auto-advanced"),
    });
    assertEquals(result.usage, {
        credits: { default: 2 },
        evidence: { CREDIT: 2 },
    });
});

Deno.test("tavily#search provider error (synthetic 401): data, zero usage", async () => {
    const unit = await testSealedUnit("tavily#search");
    const result = await runEndpoint({
        unit,
        input: { body: { query: "anything" } },
        mode: "replay",
        fixture: await fixture("synthetic-unauthorized"),
    });
    assertEquals(result.httpStatus, 401);
    assertEquals(result.isProviderError, true);
    assertEquals(result.usage, { credits: {}, evidence: {} });
});

Deno.test("tavily#extract (synthetic): failed URLs are free, advanced doubles the rate", async () => {
    const unit = await testSealedUnit("tavily#extract");
    const urls = [
        "https://example.com/article",
        "https://example.org/guide",
        "https://example.com/unavailable",
    ];
    const held = await estimateEndpoint(unit, {
        body: { urls, extract_depth: "advanced" },
    });
    assertEquals(held.evidence, { extraction: 3, advanced_extraction: 3 });
    assertEquals(
        (await estimateEndpoint(unit, { body: { urls: urls[0] } })).evidence,
        { extraction: 1 },
    );

    const result = await runEndpoint({
        unit,
        input: { body: { urls, extract_depth: "advanced" } },
        mode: "replay",
        fixture: await fixture("synthetic-extract-partial"),
    });
    assertEquals(result.httpStatus, 200);
    // 2 successful URLs x (0.2 + 0.2); the vendor's accruing 0 is ignored
    assertEquals(result.usage.evidence, {
        extraction: 2,
        advanced_extraction: 2,
    });
    assertAlmostEquals(result.usage.credits.default, 0.8, 1e-9);
    assertEquals(result.usage.mismatch, undefined);
});

Deno.test("tavily#map (synthetic): limit defaults to 50 for the hold, settles per returned URL", async () => {
    const unit = await testSealedUnit("tavily#map");
    const held = await estimateEndpoint(unit, {
        body: { url: "docs.tavily.com" },
    });
    assertEquals(held.evidence, { page: 50 });
    assertAlmostEquals(held.credits.default, 5, 1e-9);
    assertEquals(
        (await estimateEndpoint(unit, {
            body: { url: "docs.tavily.com", limit: 20, instructions: "SDK" },
        })).evidence,
        { page: 20, instructed_page: 20 },
    );

    const result = await runEndpoint({
        unit,
        input: { body: { url: "docs.tavily.com" } },
        mode: "replay",
        fixture: await fixture("synthetic-map-ok"),
    });
    assertEquals(result.usage.evidence, { page: 3 });
    assertAlmostEquals(result.usage.credits.default, 0.3, 1e-9);
});

Deno.test("tavily#crawl (synthetic): map cost + extraction cost per returned page", async () => {
    const unit = await testSealedUnit("tavily#crawl");
    // vendor example: 10 pages at basic depth = 1 + 2 = 3 credits
    const basic = await estimateEndpoint(unit, {
        body: { url: "docs.tavily.com", limit: 10 },
    });
    assertAlmostEquals(basic.credits.default, 3, 1e-9);
    // ... and 1 + 4 = 5 at advanced depth
    const advanced = await estimateEndpoint(unit, {
        body: { url: "docs.tavily.com", limit: 10, extract_depth: "advanced" },
    });
    assertAlmostEquals(advanced.credits.default, 5, 1e-9);

    const result = await runEndpoint({
        unit,
        input: { body: { url: "docs.tavily.com", instructions: "pricing" } },
        mode: "replay",
        fixture: await fixture("synthetic-crawl-ok"),
    });
    assertEquals(result.usage.evidence, {
        page: 2,
        instructed_page: 2,
        extraction: 2,
    });
    assertAlmostEquals(result.usage.credits.default, 0.8, 1e-9);
});

Deno.test({
    name: "tavily#search live (gated on TAVILY_API_KEY)",
    ignore: liveSkip("tavily"),
    fn: async () => {
        const unit = await testSealedUnit("tavily#search");
        const result = await runEndpoint({
            unit,
            input: { body: { query: "deno 2 workspaces", max_results: 2 } },
            mode: "live",
        });
        assertEquals(
            result.isProviderError,
            false,
            JSON.stringify(result.output),
        );
        assertEquals(result.usage.credits, { default: 1 });
        assert(!("usage" in (result.output as Record<string, unknown>)));
    },
});
