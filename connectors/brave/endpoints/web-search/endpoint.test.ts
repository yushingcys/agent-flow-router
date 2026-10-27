import { assert, assertEquals, assertRejects } from "@std/assert";
import type { Json } from "@shared/core";
import { fromFileUrl } from "@std/path";
import {
    liveSkip,
    loadFixture,
    runEndpoint,
    testBundle,
    testSealedUnit,
} from "@shared/testing";

const fixturesDir = fromFileUrl(new URL("../../fixtures/", import.meta.url));

Deno.test("brave: five GET endpoints, one auth fn, flat PER_CALL 1, no consolidate", async () => {
    const bundle = await testBundle();
    const ids = Object.keys(bundle.endpoints).filter((id) =>
        id.startsWith("brave#")
    ).sort();
    assertEquals(ids, [
        "brave#res/v1/images/search",
        "brave#res/v1/llm/context",
        "brave#res/v1/news/search",
        "brave#res/v1/videos/search",
        "brave#res/v1/web/search",
    ]);
    const auth = bundle.endpoints[ids[0]].auth.inject.$fn.key;
    for (const id of ids) {
        const doc = bundle.endpoints[id];
        assertEquals(doc.request.method, "GET", id);
        assertEquals(
            doc.request.url,
            `https://api.search.brave.com/${id.slice("brave#".length)}`,
        );
        assertEquals(doc.auth.inject.$fn.key, auth, id);
        assertEquals(doc.usage.consolidate, undefined, id);
        assertEquals(Object.keys(doc.usage.credits), ["default"], id);
        assertEquals(doc.usage.model.kind, "PER_CALL", id);
        assertEquals(
            "consumes" in doc.usage.model ? doc.usage.model.consumes : null,
            { credit: "default", amount: 1 },
            id,
        );
    }
});

Deno.test("brave#res/v1/web/search happy (synthetic): one request billed", async () => {
    const unit = await testSealedUnit("brave#res/v1/web/search");
    const fixture = await loadFixture(
        `${fixturesDir}synthetic-web-search-ok.json`,
    );
    const result = await runEndpoint({
        unit,
        input: { queryParams: { q: "deno workspaces", count: 2 } },
        mode: "replay",
        fixture,
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.isProviderError, false);
    assertEquals(result.usage, {
        credits: { default: 1 },
        evidence: { CALL: 1 },
    });
    const web = (result.output as { web: { results: unknown[] } }).web;
    assertEquals(web.results.length, 2);
});

Deno.test("brave#res/v1/web/search provider error (synthetic 422): data, zero usage", async () => {
    const unit = await testSealedUnit("brave#res/v1/web/search");
    const fixture = await loadFixture(
        `${fixturesDir}synthetic-invalid-token.json`,
    );
    const result = await runEndpoint({
        unit,
        input: { queryParams: { q: "anything" } },
        mode: "replay",
        fixture,
    });
    assertEquals(result.httpStatus, 422);
    assertEquals(result.isProviderError, true);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals(
        (result.output as { message: string }).message,
        "The provided subscription token is invalid.",
    );
});

Deno.test("brave#res/v1/web/search: q required; bounds; strict keys", async () => {
    const unit = await testSealedUnit("brave#res/v1/web/search");
    const fixture = await loadFixture(
        `${fixturesDir}synthetic-web-search-ok.json`,
    );
    const rejected: Record<string, Json>[] = [
        {},
        { q: "" },
        { q: "x".repeat(601) },
        { q: "x", count: 0 },
        { q: "x", count: 21 },
        { q: "x", offset: 10 },
        { q: "x", safesearch: "medium" },
        { q: "x", goggles: ["a", "b", "c", "d"] },
        { q: "x", bogus: 1 },
    ];
    for (const queryParams of rejected) {
        await assertRejects(
            () =>
                runEndpoint({
                    unit,
                    input: { queryParams },
                    mode: "replay",
                    fixture,
                }),
            Error,
            "INVALID_INPUT",
            JSON.stringify(queryParams),
        );
    }
});

Deno.test({
    name: "brave#res/v1/web/search live (gated on BRAVE_API_KEY)",
    ignore: liveSkip("brave"),
    fn: async () => {
        const unit = await testSealedUnit("brave#res/v1/web/search");
        const result = await runEndpoint({
            unit,
            input: { queryParams: { q: "deno workspaces", count: 2 } },
            mode: "live",
        });
        assertEquals(
            result.isProviderError,
            false,
            JSON.stringify(result.output),
        );
        assertEquals(result.usage.credits, { default: 1 });
        assert(typeof result.output === "object" && result.output !== null);
    },
});
