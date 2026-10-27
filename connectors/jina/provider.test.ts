import { assertEquals, assertRejects } from "@std/assert";
import { fromFileUrl } from "@std/path";
import type { Json, RunInput } from "@shared/core";
import {
    estimateEndpoint,
    liveSkip,
    loadFixture,
    runEndpoint,
    testBundle,
    testSealedUnit,
} from "@shared/testing";

const fixturesDir = fromFileUrl(new URL("./fixtures/", import.meta.url));
const fixture = (name: string) => loadFixture(`${fixturesDir}${name}.json`);

const READ = { body: { url: "https://example.com", tokenBudget: 5000 } };
const SEARCH = { body: { q: "jina reader", tokenBudget: 20_000 } };
const RERANK = {
    body: {
        model: "jina-reranker-v3",
        query: "renewable energy",
        documents: [
            "Blockchain is reshaping payments.",
            "Solar and wind power are growing fastest.",
        ],
    },
};

Deno.test("jina#read happy (recorded): bills meta.usage.tokens, envelope unwrapped", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("jina#read"),
        input: READ,
        mode: "replay",
        fixture: await fixture("read-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, {
        credits: { default: 341 },
        evidence: { TOKEN: 341 },
    });
    const output = result.output as Record<string, Json>;
    assertEquals(output.title, "Example Domain");
    assertEquals(output.url, "https://example.com/");
    assertEquals("meta" in output, false);
});

Deno.test("jina#read over budget (recorded 409): data, zero usage", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("jina#read"),
        input: { body: { url: "https://example.com", tokenBudget: 10 } },
        mode: "replay",
        fixture: await fixture("budget-exceeded-read"),
    });
    assertEquals(result.httpStatus, 409);
    assertEquals(result.isProviderError, true);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    const output = result.output as Record<string, Json>;
    assertEquals(output.code, "BudgetExceededError");
    assertEquals(
        output.message,
        "Token budget (10) exceeded, intended charge amount 341",
    );
});

Deno.test("jina#search happy (synthetic): bills the per-search tokens, results array", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("jina#search"),
        input: SEARCH,
        mode: "replay",
        fixture: await fixture("synthetic-search-ok"),
    });
    assertEquals(result.usage, {
        credits: { default: 10_000 },
        evidence: { TOKEN: 10_000 },
    });
    assertEquals((result.output as Json[]).length, 2);
});

Deno.test("jina#search unauthorized (recorded 401): message and code lifted", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("jina#search"),
        input: SEARCH,
        mode: "replay",
        fixture: await fixture("unauthorized-search"),
    });
    assertEquals(result.httpStatus, 401);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals(
        (result.output as Record<string, Json>).code,
        "AuthenticationRequiredError",
    );
});

Deno.test("jina#v1/rerank happy (synthetic): bills usage.total_tokens, receipt stripped", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("jina#v1/rerank"),
        input: RERANK,
        mode: "replay",
        fixture: await fixture("synthetic-rerank-ok"),
    });
    assertEquals(result.usage, {
        credits: { default: 42 },
        evidence: { TOKEN: 42 },
    });
    const output = result.output as Record<string, Json>;
    assertEquals("usage" in output, false);
    assertEquals((output.results as Json[]).length, 2);
});

Deno.test("jina#v1/rerank unauthorized (recorded 401): detail becomes the message", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("jina#v1/rerank"),
        input: RERANK,
        mode: "replay",
        fixture: await fixture("unauthorized-rerank"),
    });
    assertEquals(result.httpStatus, 401);
    const output = result.output as Record<string, Json>;
    assertEquals(output.code, "AUTH_MISSING_API_KEY");
    assertEquals(
        (output.message as string).startsWith("Authentication required."),
        true,
    );
});

Deno.test("jina estimates: the stated budget, or the rerank ceiling", async () => {
    const read = await estimateEndpoint(
        await testSealedUnit("jina#read"),
        READ as RunInput,
    );
    assertEquals(read.credits, { default: 5000 });
    const search = await estimateEndpoint(
        await testSealedUnit("jina#search"),
        SEARCH as RunInput,
    );
    assertEquals(search.credits, { default: 20_000 });
    // 3 tokens per code unit of query+doc, plus 8 per pair: (16+33)*3+8 +
    // (16+41)*3+8 = 155 + 179
    const rerank = await estimateEndpoint(
        await testSealedUnit("jina#v1/rerank"),
        RERANK as RunInput,
    );
    assertEquals(rerank.credits, { default: 334 });
    // read and search share one estimate source
    const bundle = await testBundle();
    assertEquals(
        bundle.endpoints["jina#read"].usage.estimate.$fn.key,
        bundle.endpoints["jina#search"].usage.estimate.$fn.key,
    );
});

Deno.test("jina inputs: budgets required and bounded; unknown keys rejected", async () => {
    const cases: [string, Record<string, Json>][] = [
        ["jina#read", { url: "https://example.com" }],
        ["jina#read", { url: "https://example.com", tokenBudget: 0 }],
        ["jina#read", { url: "not-a-url", tokenBudget: 100 }],
        ["jina#read", {
            url: "https://example.com",
            tokenBudget: 100,
            timeout: 181,
        }],
        ["jina#read", {
            url: "https://example.com",
            tokenBudget: 100,
            bogus: 1,
        }],
        ["jina#search", { q: "x" }],
        ["jina#search", { q: "x", tokenBudget: 9999 }],
        ["jina#search", { q: "x", tokenBudget: 10_000, num: 21 }],
        ["jina#v1/rerank", { ...RERANK.body, documents: [] }],
        ["jina#v1/rerank", { ...RERANK.body, model: "jina-reranker-m0" }],
    ];
    const readOk = await fixture("read-ok");
    for (const [id, body] of cases) {
        const unit = await testSealedUnit(id);
        await assertRejects(
            () =>
                runEndpoint({
                    unit,
                    input: { body },
                    mode: "replay",
                    fixture: readOk,
                }),
            Error,
            "INVALID_INPUT",
            `${id} ${JSON.stringify(body)}`,
        );
    }
});

Deno.test({
    name: "jina#read live (gated on JINA_API_KEY)",
    ignore: liveSkip("jina"),
    fn: async () => {
        const result = await runEndpoint({
            unit: await testSealedUnit("jina#read"),
            input: READ,
            mode: "live",
        });
        assertEquals(
            result.isProviderError,
            false,
            JSON.stringify(result.output),
        );
        assertEquals(typeof result.usage.credits.default, "number");
    },
});
