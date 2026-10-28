import { assertEquals, assertRejects } from "@std/assert";
import { fromFileUrl } from "@std/path";
import type { Json } from "@shared/core";
import {
    liveSkip,
    loadFixture,
    runEndpoint,
    testSealedUnit,
} from "@shared/testing";

const ID = "contextdev#web/answers";
const fixturesDir = fromFileUrl(new URL("./fixtures/", import.meta.url));
const INPUT = {
    body: {
        task: "Where is stripe.com headquartered?",
        mode: "fast",
        json_format: { company: "", headquarters_city: "" },
    },
};

Deno.test(`${ID} happy (synthetic): a fast answer bills ten credits`, async () => {
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
        evidence: { fast: 1, ultra: 0 },
    });
    const { key_metadata: _envelope, ...body } = fixture.calls[0].res
        .body as Record<string, Json>;
    assertEquals(result.output, body);
});

Deno.test(`${ID} ultra (synthetic): the default mode bills a hundred, and the vendor agrees`, async () => {
    const unit = await testSealedUnit(ID);
    const fixture = await loadFixture(`${fixturesDir}synthetic-happy.json`);
    (fixture.calls[0].res.body as {
        key_metadata: { credits_consumed: number };
    })
        .key_metadata.credits_consumed = 100;
    const { mode: _mode, ...body } = INPUT.body;
    const result = await runEndpoint({
        unit,
        input: { body },
        mode: "replay",
        fixture,
    });
    assertEquals(result.usage, {
        credits: { default: 100 },
        evidence: { fast: 0, ultra: 1 },
    });
});

Deno.test(`${ID} provider error (synthetic 408): zero usage`, async () => {
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
    assertEquals(result.httpStatus, 408);
    assertEquals(result.isProviderError, true);
    assertEquals(result.usage, { credits: {}, evidence: {} });
});

Deno.test(`${ID}: the task is required, the mode closed, the body strict`, async () => {
    const unit = await testSealedUnit(ID);
    const fixture = await loadFixture(`${fixturesDir}synthetic-happy.json`);
    const run = (body: Record<string, unknown>) =>
        runEndpoint({
            unit,
            input: { body: body as Record<string, Json> },
            mode: "replay",
            fixture,
        });
    for (
        const bad of [
            {},
            { task: "" },
            { task: "x".repeat(2001) },
            { task: "who", mode: "pro" },
            { task: "who", json_format: "a string" },
            { task: "who", timeoutOpts: { milliseconds: 999 } },
            { task: "who", tags: ["x"] },
        ]
    ) {
        await assertRejects(() => run(bad), Error, "INVALID_INPUT");
    }
    const twin = await run({
        task: "who",
        mode: "ultra",
        timeoutOpts: { milliseconds: 300000, behavior: "return-partial" },
        zdr: "disabled",
    });
    assertEquals(twin.httpStatus, 200);
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
        assertEquals(result.usage.evidence, { fast: 1, ultra: 0 });
        assertEquals(
            Array.isArray((result.output as Record<string, unknown>).sources),
            true,
            JSON.stringify(result.output),
        );
    },
});
