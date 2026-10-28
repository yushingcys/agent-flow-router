import { assert, assertAlmostEquals, assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";
import {
    estimateEndpoint,
    loadFixture,
    runEndpoint,
    testBundle,
    testSealedUnit,
} from "@shared/testing";
import { directTransport, Engine } from "@agent-flow/connector-engine";

const fixtures = fromFileUrl(new URL("./fixtures/", import.meta.url));
const fixture = (name: string) => loadFixture(`${fixtures}${name}.json`);
const CENT = 1e-12;
const UPLOAD = { base64: "SUQz", contentType: "audio/mpeg", filename: "a.mp3" };

/** A transport that records what went out and answers one canned body. */
function capture(body: unknown) {
    const seen: { url: string; init: RequestInit }[] = [];
    const engine = new Engine({
        transport: directTransport({
            params: () => Promise.resolve({ apiKey: "k" }),
            fetch: (url, init) => {
                seen.push({ url: String(url), init: init as RequestInit });
                return Promise.resolve(new Response(JSON.stringify(body)));
            },
        }),
    });
    return { engine, seen };
}

Deno.test("fishaudio: eight endpoints under Monid's paths, one auth fn", async () => {
    const bundle = await testBundle();
    const ids = Object.keys(bundle.endpoints)
        .filter((id) => id.startsWith("fishaudio#")).sort();
    assertEquals(ids, [
        "fishaudio#speech-to-text",
        "fishaudio#text-to-speech",
        "fishaudio#text-to-speech/timestamps",
        "fishaudio#voice-design",
        "fishaudio#voices",
        "fishaudio#voices/clone",
        "fishaudio#voices/delete",
        "fishaudio#voices/get",
    ]);
    const auth = bundle.endpoints[ids[0]].auth.inject.$fn.key;
    for (const id of ids) {
        assertEquals(bundle.endpoints[id].auth.inject.$fn.key, auth, id);
    }
});

Deno.test("fishaudio#text-to-speech: model moves to the header; billed per UTF-8 byte", async () => {
    const unit = await testSealedUnit("fishaudio#text-to-speech");
    const result = await runEndpoint({
        unit,
        input: { body: { text: "héllo", reference_id: "v1" } },
        mode: "replay",
        fixture: await fixture("synthetic-tts-ok"),
    });
    assertEquals(result.httpStatus, 200);
    // é is two bytes in UTF-8
    assertEquals(result.usage.evidence, { text_byte: 6 });
    assertAlmostEquals(result.usage.credits.default, 6 * 0.000015, CENT);
    const output = result.output as Record<string, string>;
    assertEquals(output.content_type, "audio/mpeg");
    assertEquals(Uint8Array.fromBase64(output.audio_base64).length, 64);

    const { engine, seen } = capture({});
    await (await engine.load(unit)).run({
        body: { text: "hi", model: "drama-3" },
    });
    const headers = seen[0].init.headers as Record<string, string>;
    assertEquals(headers.model, "drama-3");
    assertEquals(JSON.parse(seen[0].init.body as string), { text: "hi" });
    assertEquals(
        (await estimateEndpoint(unit, {
            body: { text: "hi", model: "drama-3" },
        }))
            .evidence,
        { drama_text_byte: 2 },
    );
});

Deno.test("fishaudio#text-to-speech/timestamps: the stream assembles into one audio and absolute timings", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("fishaudio#text-to-speech/timestamps"),
        input: { body: { text: "Hi there. Bye." } },
        mode: "replay",
        fixture: await fixture("synthetic-tts-timestamps-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage.evidence, { text_byte: 14 });
    const output = result.output as Record<string, unknown>;
    // the padded first chunk was re-encoded, not concatenated
    assertEquals(output.audio_base64, "//uQZAECAwQ=");
    assertEquals(output.content_type, "audio/mpeg");
    assertAlmostEquals(output.audio_duration as number, 1.2, 1e-9);
    assertEquals(
        (output.segments as { text: string }[]).map((s) => s.text),
        ["Hi", "there", "Bye"],
    );
    const bye = (output.segments as { start: number; end: number }[])[2];
    assertAlmostEquals(bye.start, 0.8, 1e-9);
});

Deno.test("fishaudio#speech-to-text: multipart upload, model header, billed per second of duration", async () => {
    const unit = await testSealedUnit("fishaudio#speech-to-text");
    const replay = await runEndpoint({
        unit,
        input: { body: { audio: UPLOAD } },
        mode: "replay",
        fixture: await fixture("synthetic-asr-ok"),
    });
    assertEquals(replay.usage.evidence, { SECOND: 91 });
    assertAlmostEquals(replay.usage.credits.default, 91 * 0.0001, CENT);

    const { engine, seen } = capture({ text: "", duration: 1, segments: [] });
    await (await engine.load(unit)).run({
        body: { audio: UPLOAD, language: "en" },
    });
    const form = seen[0].init.body as FormData;
    assert(form instanceof FormData);
    assertEquals(form.get("language"), "en");
    assertEquals(form.has("model"), false);
    assertEquals((form.get("audio") as File).name, "a.mp3");
    assertEquals(
        (seen[0].init.headers as Record<string, string>).model,
        "transcribe-1-pro",
    );
});

Deno.test("fishaudio#voices/clone: recordings go out as repeated file parts; free", async () => {
    const unit = await testSealedUnit("fishaudio#voices/clone");
    assertEquals(unit.doc.usage.model.kind, "FREE");
    const { engine, seen } = capture({ _id: "m1", state: "trained" });
    const result = await (await engine.load(unit)).run({
        body: { title: "Me", voices: [UPLOAD, UPLOAD], texts: ["a", "b"] },
    });
    assertEquals(result.httpStatus, 200);
    const form = seen[0].init.body as FormData;
    assertEquals(form.get("type"), "tts");
    assertEquals(form.get("train_mode"), "fast");
    assertEquals(form.getAll("voices").length, 2);
    assertEquals(form.getAll("texts"), ["a", "b"]);
});

Deno.test("fishaudio#voice-design: static model header, $0.01 per call", async () => {
    const unit = await testSealedUnit("fishaudio#voice-design");
    assertEquals(unit.doc.request.headers?.model, "voice-design-1");
    const result = await runEndpoint({
        unit,
        input: { body: { instruction: "warm narrator", n: 1 } },
        mode: "replay",
        fixture: await fixture("synthetic-voice-design-ok"),
    });
    assertEquals(result.usage.credits, { default: 0.01 });
});

Deno.test("fishaudio: a vendor error is data, zero-billed and digested", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("fishaudio#voice-design"),
        input: { body: { instruction: "warm narrator" } },
        mode: "replay",
        fixture: await fixture("synthetic-payment-required"),
    });
    assertEquals(result.httpStatus, 402);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals(
        (result.output as Record<string, unknown>).message,
        "Insufficient balance",
    );
});
