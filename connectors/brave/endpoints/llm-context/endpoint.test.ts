import { assertEquals, assertRejects } from "@std/assert";
import { fromFileUrl } from "@std/path";
import { loadFixture, runEndpoint, testSealedUnit } from "@shared/testing";

const fixturesDir = fromFileUrl(new URL("../../fixtures/", import.meta.url));

Deno.test("brave#res/v1/llm/context happy (synthetic): one request billed, any token budget", async () => {
    const unit = await testSealedUnit("brave#res/v1/llm/context");
    const fixture = await loadFixture(
        `${fixturesDir}synthetic-llm-context-ok.json`,
    );
    const result = await runEndpoint({
        unit,
        input: {
            queryParams: {
                q: "tallest mountain in the solar system",
                maximum_number_of_tokens: 2048,
            },
        },
        mode: "replay",
        fixture,
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.isProviderError, false);
    assertEquals(result.usage, {
        credits: { default: 1 },
        evidence: { CALL: 1 },
    });
    const output = result.output as { grounding: { generic: unknown[] } };
    assertEquals(output.grounding.generic.length, 1);
});

Deno.test("brave#res/v1/llm/context: token budget bounds", async () => {
    const unit = await testSealedUnit("brave#res/v1/llm/context");
    const fixture = await loadFixture(
        `${fixturesDir}synthetic-llm-context-ok.json`,
    );
    for (const maximum_number_of_tokens of [1023, 32769]) {
        await assertRejects(
            () =>
                runEndpoint({
                    unit,
                    input: {
                        queryParams: { q: "x", maximum_number_of_tokens },
                    },
                    mode: "replay",
                    fixture,
                }),
            Error,
            "INVALID_INPUT",
        );
    }
});
