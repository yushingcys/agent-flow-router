import { assert, assertAlmostEquals, assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";
import {
    estimateEndpoint,
    loadFixture,
    runEndpoint,
    testBundle,
    testSealedUnit,
} from "@shared/testing";
import type { Json } from "@shared/core";
import { directTransport, Engine } from "@agent-flow/connector-engine";

const fixtures = fromFileUrl(new URL("./fixtures/", import.meta.url));
const fixture = (name: string) => loadFixture(`${fixtures}${name}.json`);
const CENT = 1e-12;
/** "ID3" - three bytes of a pretend upload. */
const UPLOAD = { base64: "SUQz", contentType: "audio/mpeg", filename: "a.mp3" };

Deno.test("elevenlabs: nine endpoints under Monid's paths, one auth fn, dollars", async () => {
    const bundle = await testBundle();
    const ids = Object.keys(bundle.endpoints)
        .filter((id) => id.startsWith("elevenlabs#")).sort();
    assertEquals(ids, [
        "elevenlabs#text-to-speech",
        "elevenlabs#v1/audio-isolation",
        "elevenlabs#v1/forced-alignment",
        "elevenlabs#v1/music",
        "elevenlabs#v1/sound-generation",
        "elevenlabs#v1/speech-to-speech",
        "elevenlabs#v1/speech-to-text",
        "elevenlabs#v1/text-to-dialogue",
        "elevenlabs#voices",
    ]);
    const auth = bundle.endpoints[ids[0]].auth.inject.$fn.key;
    for (const id of ids) {
        assertEquals(bundle.endpoints[id].auth.inject.$fn.key, auth, id);
    }
    // the identical multipart relays intern to ONE fnTable entry
    const starts = new Set(
        [
            "elevenlabs#v1/audio-isolation",
            "elevenlabs#v1/forced-alignment",
            "elevenlabs#v1/speech-to-speech",
            "elevenlabs#v1/speech-to-text",
        ].map((id) => bundle.endpoints[id].lifecycle?.start?.$fn.key),
    );
    assertEquals(starts.size, 1);
});

Deno.test("elevenlabs#text-to-speech: model routes the rate; JSON audio and alignment relayed", async () => {
    const run = (model_id?: string) =>
        testSealedUnit("elevenlabs#text-to-speech").then(async (unit) =>
            runEndpoint({
                unit,
                input: {
                    pathParams: { voice_id: "JBFqnCBsd6RMkjVDRZzb" },
                    body: model_id
                        ? { text: "Hello there.", model_id }
                        : { text: "Hello there." },
                },
                mode: "replay",
                fixture: await fixture("synthetic-tts-ok"),
            })
        );
    const standard = await run();
    assertEquals(standard.httpStatus, 200);
    assertEquals(standard.usage.evidence, { character: 12 });
    assertAlmostEquals(standard.usage.credits.default, 12 * 0.00008, CENT);
    const output = standard.output as Record<string, unknown>;
    assertEquals(output.audio_base64, "//uQZAAAAAAA");
    assert("alignment" in output);
    const flash = await run("eleven_flash_v2_5");
    assertEquals(flash.usage.evidence, { flash_character: 12 });
    assertAlmostEquals(flash.usage.credits.default, 12 * 0.00004, CENT);
});

Deno.test("elevenlabs#v1/text-to-dialogue: billed on every line's characters", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("elevenlabs#v1/text-to-dialogue"),
        input: {
            body: {
                inputs: [
                    { text: "Hi", voice_id: "JBFqnCBsd6RMkjVDRZzb" },
                    { text: "Yo!", voice_id: "Aw4FAjKCGjjNkVhN1Xmq" },
                ],
            },
        },
        mode: "replay",
        fixture: await fixture("synthetic-dialogue-ok"),
    });
    assertEquals(result.usage.evidence, { CHARACTER: 5 });
    assertEquals(
        ((result.output as Record<string, unknown>).voice_segments as unknown[])
            .length,
        2,
    );
});

Deno.test("elevenlabs#v1/sound-generation: raw MP3 comes back base64 and bills its measured seconds", async () => {
    const unit = await testSealedUnit("elevenlabs#v1/sound-generation");
    const result = await runEndpoint({
        unit,
        input: {
            queryParams: { output_format: "mp3_22050_32" },
            body: { text: "door slam", duration_seconds: 5 },
        },
        mode: "replay",
        fixture: await fixture("synthetic-audio-ok"),
    });
    assertEquals(result.httpStatus, 200);
    // 4000 bytes at 32 kbps = 1 s, though 5 s were held
    assertEquals(result.usage.evidence, { SECOND: 1 });
    assertAlmostEquals(result.usage.credits.default, 0.002, CENT);
    const output = result.output as Record<string, string>;
    assertEquals(output.content_type, "audio/mpeg");
    assertEquals(
        Uint8Array.fromBase64(output.audio_base64).slice(0, 2),
        new Uint8Array([0xff, 0xfb]),
    );
    assertEquals(
        (await estimateEndpoint(unit, { body: { text: "x" } })).credits,
        { default: 30 * 0.002 },
    );
});

Deno.test("elevenlabs#v1/music: the estimate follows the requested or planned length", async () => {
    const unit = await testSealedUnit("elevenlabs#v1/music");
    const seconds = async (body: Json) =>
        (await estimateEndpoint(unit, { body })).evidence.SECOND;
    assertEquals(await seconds({ prompt: "x", music_length_ms: 30500 }), 31);
    assertEquals(await seconds({ prompt: "x" }), 300);
    assertEquals(
        await seconds({
            composition_plan: {
                positive_global_styles: [],
                negative_global_styles: [],
                sections: [10000, 20000].map((duration_ms) => ({
                    section_name: "s",
                    positive_local_styles: [],
                    negative_local_styles: [],
                    duration_ms,
                    lines: [],
                })),
            },
        }),
        30,
    );
    assertEquals(unit.doc.request.url, "https://api.elevenlabs.io/v1/music");
});

Deno.test("elevenlabs#v1/speech-to-text: the upload goes out multipart; keyterms add their line", async () => {
    let form: FormData | undefined;
    const loaded = await new Engine({
        transport: directTransport({
            params: () => Promise.resolve({ apiKey: "k" }),
            fetch: async (_url, init) => {
                form = (init as RequestInit).body as FormData;
                const replay = (await fixture("synthetic-stt-ok")).calls[0].res;
                return new Response(JSON.stringify(replay.body));
            },
        }),
    }).load(await testSealedUnit("elevenlabs#v1/speech-to-text"));
    const result = await loaded.run({
        body: {
            model_id: "scribe_v2",
            file: UPLOAD,
            diarize: true,
            keyterms: ["Fish", "Eleven"],
        },
    });
    assert(form instanceof FormData);
    assertEquals(form.get("model_id"), "scribe_v2");
    assertEquals(form.get("diarize"), "true");
    assertEquals(form.getAll("keyterms"), ["Fish", "Eleven"]);
    assertEquals((form.get("file") as File).name, "a.mp3");
    assertEquals(result.usage.evidence, {
        audio_second: 62,
        keyterm_second: 62,
    });
    assertAlmostEquals(
        result.usage.credits.default,
        62 * (0.22 + 0.05) / 3600,
        CENT,
    );
});

Deno.test("elevenlabs#v1/speech-to-text: a source_url holds an hour", async () => {
    const unit = await testSealedUnit("elevenlabs#v1/speech-to-text");
    assertEquals(
        (await estimateEndpoint(unit, {
            body: { model_id: "scribe_v2", source_url: "https://x.test/a.mp3" },
        })).evidence,
        { audio_second: 3600 },
    );
});

Deno.test("elevenlabs#v1/forced-alignment: billed to the last aligned word", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("elevenlabs#v1/forced-alignment"),
        input: { body: { file: UPLOAD, text: "Hello there" } },
        mode: "replay",
        fixture: await fixture("synthetic-alignment-ok"),
    });
    assertEquals(result.usage.evidence, { SECOND: 3 });
});

Deno.test("elevenlabs: a vendor error is data, zero-billed and digested", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("elevenlabs#v1/audio-isolation"),
        input: { body: { audio: UPLOAD } },
        mode: "replay",
        fixture: await fixture("synthetic-unauthorized"),
    });
    assertEquals(result.httpStatus, 401);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals(
        (result.output as Record<string, unknown>).message,
        "Invalid API key",
    );
});
