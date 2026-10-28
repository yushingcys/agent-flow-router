import { assertEquals, assertRejects } from "@std/assert";
import { fromFileUrl } from "@std/path";
import type { Json } from "@shared/core";
import {
    liveSkip,
    loadFixture,
    runEndpoint,
    testSealedUnit,
} from "@shared/testing";

const ID = "contextdev#brand/transaction_identifier";
const fixturesDir = fromFileUrl(new URL("./fixtures/", import.meta.url));
const INPUT = { queryParams: { transaction_info: "SQ *BLUE BOTTLE COFFEE" } };

Deno.test(`${ID} happy (synthetic): ten credits, envelope stripped`, async () => {
    const unit = await testSealedUnit(ID);
    const fixture = await loadFixture(`${fixturesDir}synthetic-happy.json`);
    const result = await runEndpoint({
        unit,
        input: INPUT,
        mode: "replay",
        fixture,
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, {
        credits: { default: 10 },
        evidence: { CALL: 1 },
    });
    const { key_metadata: _envelope, ...body } = fixture.calls[0].res
        .body as Record<string, Json>;
    assertEquals(result.output, body);
});

Deno.test(`${ID} provider error (synthetic 400 no match): zero usage, digested without the balance`, async () => {
    const unit = await testSealedUnit(ID);
    const fixture = await loadFixture(
        `${fixturesDir}synthetic-provider-error.json`,
    );
    const result = await runEndpoint({
        unit,
        input: INPUT,
        mode: "replay",
        fixture,
    });
    assertEquals(result.httpStatus, 400);
    assertEquals(result.isProviderError, true);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    const { key_metadata: _envelope, ...raw } = fixture.calls[0].res
        .body as Record<string, Json>;
    assertEquals(result.output, {
        message: "No brand found for this transaction",
        error_code: "NOT_FOUND",
        raw,
    });
});

Deno.test(`${ID}: the compiled schema gates the descriptor and the options`, async () => {
    const unit = await testSealedUnit(ID);
    const fixture = await loadFixture(`${fixturesDir}synthetic-happy.json`);
    const run = (queryParams: Record<string, unknown>) =>
        runEndpoint({
            unit,
            input: { queryParams: queryParams as Record<string, Json> },
            mode: "replay",
            fixture,
        });
    for (
        const bad of [
            {},
            { transaction_info: "" },
            { ...INPUT.queryParams, timeoutMS: 300001 },
            { ...INPUT.queryParams, high_confidence_only: "yes" },
            { ...INPUT.queryParams, type: "by_transaction" },
        ]
    ) {
        await assertRejects(() => run(bad), Error, "INVALID_INPUT");
    }
    await assertRejects(
        () =>
            run({
                ...INPUT.queryParams,
                city: "Oakland",
                country_gl: "us",
                mcc: "5814",
                high_confidence_only: true,
                timeoutMS: 300000,
            }),
        Error,
        "replay(",
    );
});

Deno.test({
    name: `${ID} live (gated on CONTEXTDEV_API_KEY)`,
    ignore: liveSkip("contextdev"),
    fn: async () => {
        const unit = await testSealedUnit(ID);
        const result = await runEndpoint({
            unit,
            input: INPUT,
            mode: "live",
        });
        assertEquals(
            result.isProviderError,
            false,
            JSON.stringify(result.output),
        );
        assertEquals(Object.keys(result.usage.evidence), ["CALL"]);
        assertEquals(
            "key_metadata" in (result.output as Record<string, unknown>),
            false,
        );
    },
});
