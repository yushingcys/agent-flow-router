import {
    assert,
    assertAlmostEquals,
    assertEquals,
    assertRejects,
} from "@std/assert";
import { fromFileUrl } from "@std/path";
import type { Json } from "@shared/core";
import {
    assertInputAccepted,
    estimateEndpoint,
    liveSkip,
    loadFixture,
    runEndpoint,
    testSealedUnit,
} from "@shared/testing";

const fixture = (name: string) =>
    loadFixture(fromFileUrl(new URL(`./fixtures/${name}`, import.meta.url)));

const AGENT = "perplexity#v1/agent";
const SEARCH = "perplexity#search";

async function run(id: string, name: string, body: Record<string, Json>) {
    return runEndpoint({
        unit: await testSealedUnit(id),
        input: { body },
        mode: "replay",
        fixture: await fixture(name),
    });
}

const QUESTION = {
    input: "What changed in Deno 2?",
    max_output_tokens: 1000,
    tools: [{ type: "web_search" }, { type: "fetch_url" }],
};

Deno.test("perplexity agent: usage.cost.total_cost settles the bill and leaves the payload", async () => {
    const result = await run(AGENT, "synthetic-agent.json", QUESTION);
    assertEquals(result.httpStatus, 200);
    assertEquals(result.isProviderError, false);
    // 616 uncached + 3584 cached input, 310 output, 2 searches, 1 fetch:
    // the card folds to the vendor's own total, so no mismatch rides out
    assertEquals(result.usage, {
        credits: { default: 0.006653 },
        evidence: {
            input_tokens: 616,
            cache_read_tokens: 3584,
            output_tokens: 310,
            web_search: 2,
            fetch_url: 1,
        },
    });
    const output = result.output as {
        usage: Record<string, unknown>;
        output: { type: string }[];
    };
    assert(!("cost" in output.usage));
    assertEquals(output.usage.input_tokens, 4200);
    assertEquals(
        output.output.map((item) => item.type),
        ["search_results", "fetch_url_results", "message"],
    );
});

Deno.test("perplexity agent: a fast web_search is metered on the fast line", async () => {
    const result = await run(AGENT, "synthetic-agent.json", {
        ...QUESTION,
        tools: [{ type: "web_search", search_type: "fast" }],
    });
    assertEquals(result.usage.evidence.fast_search, 2);
    assertEquals(result.usage.evidence.web_search, undefined);
    // the claim still wins; the card disagrees and rides as mismatch
    assertEquals(result.usage.credits, { default: 0.006653 });
    assert(result.usage.mismatch !== undefined);
});

Deno.test("perplexity agent: without a cost node the card settles", async () => {
    const f = await fixture("synthetic-agent.json");
    const body = f.calls[0].res.body as { usage: Record<string, Json> };
    delete body.usage.cost;
    const result = await runEndpoint({
        unit: await testSealedUnit(AGENT),
        input: { body: QUESTION },
        mode: "replay",
        fixture: f,
    });
    assertAlmostEquals(result.usage.credits.default, 0.006653, 1e-9);
});

Deno.test("perplexity agent: the hold is prompt bytes + output cap + one call per tool per step", async () => {
    const usage = await estimateEndpoint(await testSealedUnit(AGENT), {
        body: {
            input: [{ type: "message", role: "user", content: "héllo" }],
            instructions: "abc",
            max_output_tokens: 1000,
            max_steps: 3,
            tools: [
                { type: "web_search" },
                { type: "web_search", search_type: "fast" },
                { type: "fetch_url" },
            ],
        },
    });
    assertEquals(usage.evidence, {
        input_tokens: 9,
        output_tokens: 1000,
        web_search: 3,
        fast_search: 3,
        fetch_url: 3,
    });
    assertAlmostEquals(
        usage.credits.default,
        9 * 0.00000025 + 1000 * 0.0000025 + 3 * (0.0025 + 0.001 + 0.0005),
        1e-12,
    );
});

Deno.test("perplexity agent: only priced requests pass the gate", async () => {
    const unit = await testSealedUnit(AGENT);
    const f = await fixture("synthetic-agent.json");
    for (
        const body of <Record<string, Json>[]> [
            { input: "q" }, // no output cap
            { ...QUESTION, model: "openai/gpt-6-sol" },
            { ...QUESTION, effort: "low" },
            { ...QUESTION, models: ["perplexity/sonar"] },
            { ...QUESTION, background: true },
            { ...QUESTION, stream: true },
            { ...QUESTION, tools: [{ type: "sandbox" }] },
            { ...QUESTION, max_steps: 101 },
        ]
    ) {
        await assertRejects(
            () =>
                runEndpoint({
                    unit,
                    input: { body },
                    mode: "replay",
                    fixture: f,
                }),
            Error,
            "INVALID_INPUT",
            JSON.stringify(body),
        );
    }
    await assertInputAccepted({
        unit,
        input: { body: { ...QUESTION, model: "perplexity/sonar" } },
        mode: "replay",
        fixture: f,
    });
});

Deno.test("perplexity search: web is the default and bills $0.005", async () => {
    const result = await run(SEARCH, "synthetic-search.json", {
        query: ["deno 2", "deno workspaces"],
        max_results: 5,
    });
    assertEquals(result.isProviderError, false);
    assertEquals(result.usage, {
        credits: { default: 0.005 },
        evidence: { web_search: 1 },
    });
    assertEquals((result.output as { results: unknown[] }).results.length, 2);
});

Deno.test("perplexity search: fast search bills $0.001, estimate agrees", async () => {
    const body = { query: "deno 2", search_type: "fast" };
    const result = await run(SEARCH, "synthetic-search.json", body);
    assertEquals(result.usage, {
        credits: { default: 0.001 },
        evidence: { fast_search: 1 },
    });
    const unit = await testSealedUnit(SEARCH);
    assertEquals(
        (await estimateEndpoint(unit, { body })).credits,
        { default: 0.001 },
    );
});

Deno.test("perplexity search: unpriced people search and >20 results are rejected", async () => {
    const unit = await testSealedUnit(SEARCH);
    const f = await fixture("synthetic-search.json");
    for (
        const body of <Record<string, Json>[]> [
            { query: "q", search_type: "people" },
            { query: "q", max_results: 21 },
            { query: ["a", "b", "c", "d", "e", "f"] },
            { query: "q", search_after_date_filter: "2026-01-01" },
        ]
    ) {
        await assertRejects(
            () =>
                runEndpoint({
                    unit,
                    input: { body },
                    mode: "replay",
                    fixture: f,
                }),
            Error,
            "INVALID_INPUT",
            JSON.stringify(body),
        );
    }
});

Deno.test("perplexity: provider errors settle zero and are digested", async () => {
    for (const id of [AGENT, SEARCH]) {
        const f = await fixture("synthetic-unauthorized.json");
        const result = await runEndpoint({
            unit: await testSealedUnit(id),
            input: { body: id === AGENT ? QUESTION : { query: "q" } },
            mode: "replay",
            fixture: f,
        });
        assertEquals(result.httpStatus, 401);
        assertEquals(result.isProviderError, true);
        assertEquals(result.usage, { credits: {}, evidence: {} });
        assertEquals(result.output, {
            message: "Invalid API key provided.",
            code: "401",
            raw: f.calls[0].res.body,
        });
    }
});

Deno.test({
    name: "perplexity live (gated on PERPLEXITY_API_KEY)",
    ignore: liveSkip("perplexity"),
    fn: async () => {
        const search = await runEndpoint({
            unit: await testSealedUnit(SEARCH),
            input: { body: { query: "deno 2 release", search_type: "fast" } },
            mode: "live",
        });
        assertEquals(search.isProviderError, false);
        const agent = await runEndpoint({
            unit: await testSealedUnit(AGENT),
            input: { body: { ...QUESTION, tools: [{ type: "web_search" }] } },
            mode: "live",
        });
        assertEquals(
            agent.isProviderError,
            false,
            JSON.stringify(agent.output),
        );
        assertEquals(typeof agent.usage.credits.default, "number");
    },
});
