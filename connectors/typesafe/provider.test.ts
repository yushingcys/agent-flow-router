import { assertEquals, assertRejects } from "@std/assert";
import { fromFileUrl } from "@std/path";
import type { Json } from "@shared/core";
import {
    estimateEndpoint,
    liveSkip,
    loadFixture,
    runEndpoint,
    testSealedUnit,
} from "@shared/testing";

const fixturesDir = fromFileUrl(new URL("./fixtures/", import.meta.url));
const fixture = (name: string) => loadFixture(`${fixturesDir}${name}.json`);

const STATE = "I was charged twice for my subscription this month.";
const QUESTIONS = {
    billing: { type: "noul", instructions: "Is this message about billing?" },
    tone: {
        type: "choice",
        instructions: "What is the tone of this message?",
        criteria: {
            angry: "An upset or hostile message",
            calm: "A neutral or polite message",
            excited: "An enthusiastic or eager message",
        },
    },
};
const BODY = { model: "jev-latest", state: STATE, questions: QUESTIONS };

Deno.test("typesafe#systemone happy (synthetic): bills usage.input_tokens, receipt stripped", async () => {
    const unit = await testSealedUnit("typesafe#systemone");
    assertEquals(unit.doc.request.url, "https://api.typesafe.ai/v1/systemone");
    const result = await runEndpoint({
        unit,
        input: { body: BODY },
        mode: "replay",
        fixture: await fixture("synthetic-systemone-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, {
        credits: { default: 120 },
        evidence: { TOKEN: 120 },
    });
    const output = result.output as Record<string, Json>;
    assertEquals(output.model, "jev-1.14.0");
    assertEquals("usage" in output, false);
    assertEquals(Object.keys(output.answers as object), ["billing", "tone"]);
});

Deno.test("typesafe#systemone estimate: 3 tokens per char of JSON state+questions", async () => {
    const unit = await testSealedUnit("typesafe#systemone");
    const chars = JSON.stringify({ state: STATE, questions: QUESTIONS }).length;
    assertEquals(
        (await estimateEndpoint(unit, { body: BODY })).credits,
        { default: 3 * chars },
    );
});

Deno.test("typesafe#systemone provider error (synthetic 422): data, zero usage", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("typesafe#systemone"),
        input: { body: { ...BODY, model: "jev-0.0.0" } },
        mode: "replay",
        fixture: await fixture("synthetic-validation-error"),
    });
    assertEquals(result.httpStatus, 422);
    assertEquals(result.isProviderError, true);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals(
        (result.output as { message: string }).message,
        "Unknown model: jev-0.0.0",
    );
});

Deno.test("typesafe#systemone: required fields, no box questions, strict keys", async () => {
    const unit = await testSealedUnit("typesafe#systemone");
    const synthetic = await fixture("synthetic-systemone-ok");
    const rejected: Json[] = [
        { state: STATE, questions: QUESTIONS },
        { model: "jev-latest", questions: QUESTIONS },
        { model: "jev-latest", state: STATE },
        { ...BODY, questions: { where: { type: "box" } } },
        { ...BODY, questions: { tone: { type: "choice" } } },
        { ...BODY, questions: { lvl: { type: "score", criteria: [] } } },
        { ...BODY, assets: { a: { type: "image" } } },
    ];
    for (const body of rejected) {
        await assertRejects(
            () =>
                runEndpoint({
                    unit,
                    input: { body },
                    mode: "replay",
                    fixture: synthetic,
                }),
            Error,
            "INVALID_INPUT",
            JSON.stringify(body),
        );
    }
});

Deno.test({
    name: "typesafe#systemone live (gated on TYPESAFE_API_KEY)",
    ignore: liveSkip("typesafe"),
    fn: async () => {
        const result = await runEndpoint({
            unit: await testSealedUnit("typesafe#systemone"),
            input: { body: BODY },
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
