import { assert, assertAlmostEquals, assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";
import { type Json, RunKind } from "@shared/core";
import {
    estimateEndpoint,
    loadEndpoint,
    loadFixture,
    runEndpoint,
    testSealedUnit,
} from "@shared/testing";

/**
 * The recall suite. Chains are SYNTHETIC (no Recall key on 2026-10-29),
 * built from the Bot schema in the OpenAPI at docs.recall.ai/reference/
 * bot_create. Dollar amounts are typed by hand from the rate card.
 */

const HERE = fromFileUrl(new URL("./", import.meta.url));
const fixture = (name: string) => loadFixture(`${HERE}fixtures/${name}.json`);
const ID = "recall#meetings/record";
const EPS = 1e-9;
const BODY = {
    meeting_url: "https://zoom.us/j/123?pwd=456",
    max_duration_minutes: 60,
};

Deno.test("recall: a recorded meeting settles bot time and transcription", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit(ID),
        input: { body: BODY },
        mode: "replay",
        fixture: await fixture("synthetic-recorded"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage.evidence, {
        bot_time: 1800,
        transcription: 1680,
    });
    // 0.5 h x $0.50 + 28 min x $0.15/h
    assertAlmostEquals(result.usage.credits.default, 0.25 + 0.07, EPS);
    const out = result.output as Record<string, Json>;
    assertEquals(out.bot_id, "bot-1");
    assertEquals(out.platform, "zoom");
    assertEquals(out.status, "done");
    assertEquals(
        out.transcript_url,
        "https://us-west-2.recall.ai/media/transcript.json",
    );
    assertEquals(out.media_url, "https://us-west-2.recall.ai/media/audio.mp3");
});

Deno.test("recall: platform captions bill bot time only", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit(ID),
        input: { body: { ...BODY, transcript_model: "captions" } },
        mode: "replay",
        fixture: await fixture("synthetic-recorded"),
    });
    assertEquals(result.usage.evidence, { bot_time: 1800 });
    assertAlmostEquals(result.usage.credits.default, 0.25, EPS);
});

Deno.test("recall: fatal bots and an empty bot pool are zero-billed", async () => {
    const unit = await testSealedUnit(ID);
    const fatal = await runEndpoint({
        unit,
        input: { body: BODY },
        mode: "replay",
        fixture: await fixture("synthetic-fatal"),
    });
    assertEquals(fatal.httpStatus, 500);
    assertEquals(fatal.usage.credits, {});
    const pool = await runEndpoint({
        unit,
        input: { body: BODY },
        mode: "replay",
        fixture: await fixture("synthetic-pool-empty"),
    });
    assertEquals(pool.httpStatus, 507);
    assertEquals(pool.usage.credits, {});
});

Deno.test("recall: the hold is max duration + waiting room, plus transcription", async () => {
    const usage = await estimateEndpoint(await testSealedUnit(ID), {
        body: BODY,
    });
    assertEquals(usage.evidence, { bot_time: 4800, transcription: 3600 });
    assertAlmostEquals(
        usage.credits.default,
        4800 * 0.5 / 3600 + 0.15,
        EPS,
    );
});

Deno.test("recall: stop deletes a scheduled bot, unbilled", async () => {
    const input = { body: { ...BODY, join_at: "2026-10-30T10:00:00Z" } };
    const loaded = await loadEndpoint({
        unit: await testSealedUnit(ID),
        input,
        mode: "replay",
        fixture: await fixture("synthetic-stop-scheduled"),
    });
    const run = { runId: "run-1" };
    const started = await loaded.start(input, run);
    assert(started.kind === RunKind.RUNNING);
    const stopped = await loaded.stop(input, started.state, run);
    assert(stopped.kind === RunKind.COMPLETED, "stop settles");
    assertEquals(stopped.usage.credits, {});
});

Deno.test("recall: stop makes an in-call bot leave and settles its time", async () => {
    const input = { body: BODY };
    const loaded = await loadEndpoint({
        unit: await testSealedUnit(ID),
        input,
        mode: "replay",
        fixture: await fixture("synthetic-stop-in-call"),
    });
    const run = { runId: "run-2" };
    const started = await loaded.start(input, run);
    assert(started.kind === RunKind.RUNNING);
    const stopped = await loaded.stop(input, started.state, run);
    assert(stopped.kind === RunKind.COMPLETED, "stop settles");
    assertEquals(stopped.usage.evidence, { bot_time: 600 });
});
