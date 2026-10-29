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

const fixtures = fromFileUrl(new URL("./fixtures/", import.meta.url));
const fixture = (name: string) => loadFixture(`${fixtures}${name}.json`);

Deno.test("censusdata: Monid's two endpoints, query per call, explore free", async () => {
    const bundle = await testBundle();
    const ids = Object.keys(bundle.endpoints).filter((id) =>
        id.startsWith("censusdata#")
    ).sort();
    assertEquals(ids, ["censusdata#explore-variables", "censusdata#query"]);
    assertEquals(
        bundle.endpoints["censusdata#query"].usage.model.kind,
        "PER_CALL",
    );
    assertEquals(
        bundle.endpoints["censusdata#explore-variables"].usage.model.kind,
        "FREE",
    );
});

Deno.test("censusdata#query happy (synthetic): one query billed, quota stripped", async () => {
    const unit = await testSealedUnit("censusdata#query");
    const result = await runEndpoint({
        unit,
        input: { queryParams: { q: "Population of Boise, ID in 2022" } },
        mode: "replay",
        fixture: await fixture("synthetic-query-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, {
        credits: { default: 1 },
        evidence: { CALL: 1 },
    });
    const output = result.output as Record<string, unknown>;
    assertEquals("quota" in output, false);
    assertEquals((output.raw_data as unknown[]).length, 1);
});

Deno.test("censusdata#query provider error (synthetic 401): data, zero usage", async () => {
    const unit = await testSealedUnit("censusdata#query");
    const result = await runEndpoint({
        unit,
        input: { queryParams: { q: "anything" } },
        mode: "replay",
        fixture: await fixture("synthetic-invalid-key"),
    });
    assertEquals(result.httpStatus, 401);
    assertEquals(result.isProviderError, true);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals(
        (result.output as { message: string }).message,
        "Invalid API key.",
    );
});

Deno.test("censusdata#query: q required, strict keys", async () => {
    const unit = await testSealedUnit("censusdata#query");
    const synthetic = await fixture("synthetic-query-ok");
    const rejected: Record<string, Json>[] = [
        {},
        { q: "" },
        { q: "x", api_key: "k" },
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

Deno.test("censusdata#explore-variables (synthetic): free lookup", async () => {
    const unit = await testSealedUnit("censusdata#explore-variables");
    const result = await runEndpoint({
        unit,
        input: { queryParams: { keyword: "veterans" } },
        mode: "replay",
        fixture: await fixture("synthetic-explore-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals((result.output as { total_found: number }).total_found, 2);
});

Deno.test({
    name: "censusdata#query live (gated on CENSUSDATA_API_KEY)",
    ignore: liveSkip("censusdata"),
    fn: async () => {
        const unit = await testSealedUnit("censusdata#query");
        const result = await runEndpoint({
            unit,
            input: { queryParams: { q: "Population of Boise, ID in 2022" } },
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
