import { assert, assertAlmostEquals, assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";
import type { Json, OwnedResource } from "@shared/core";
import {
    estimateEndpoint,
    loadEndpoint,
    loadFixture,
    runEndpoint,
    testBundle,
    testSealedUnit,
} from "@shared/testing";

/**
 * The heygen suite. Every chain is SYNTHETIC (no HeyGen key was available
 * on 2026-10-29), built from the documented request/response shapes at
 * developers.heygen.com. Expected dollar amounts are typed by hand from
 * the rate card, never re-derived from the doc.
 */

const HERE = fromFileUrl(new URL("./", import.meta.url));
const fixture = (name: string) => loadFixture(`${HERE}fixtures/${name}.json`);
const EPS = 1e-9;
const credits = (r: { usage: { credits: Record<string, number> } }) =>
    r.usage.credits.default ?? 0;

const VOICE: OwnedResource = {
    resource: "heygen/voice",
    externalId: "vc-1",
    data: { name: "Narrator" },
};
const PUBLIC_VOICE = "83548de556df48ba8c09c42a57c51d85";

Deno.test("heygen: ten endpoints under Monid's paths, one auth fn, shared lifecycle fns", async () => {
    const bundle = await testBundle();
    const ids = Object.keys(bundle.endpoints)
        .filter((id) => id.startsWith("heygen#")).sort();
    assertEquals(ids, [
        "heygen#promo/text-to-speech/turbo-free",
        "heygen#speech-to-speech",
        "heygen#text-to-speech",
        "heygen#v1/video/heygen-video-1-i2v",
        "heygen#v1/video/heygen-video-1-r2v",
        "heygen#v1/video/heygen-video-1-t2v",
        "heygen#voices",
        "heygen#voices/clone",
        "heygen#voices/delete",
        "heygen#voices/get",
    ]);
    const key = (id: string, hook: "start" | "poll") =>
        bundle.endpoints[id].lifecycle?.[hook]?.$fn.key;
    const gates = new Set([
        "heygen#voices/get",
        "heygen#text-to-speech",
        "heygen#promo/text-to-speech/turbo-free",
        "heygen#speech-to-speech",
    ].map((id) => key(id, "start")));
    assertEquals(gates.size, 1);
    const videos = [
        "heygen#v1/video/heygen-video-1-t2v",
        "heygen#v1/video/heygen-video-1-i2v",
        "heygen#v1/video/heygen-video-1-r2v",
    ];
    assertEquals(new Set(videos.map((id) => key(id, "start"))).size, 1);
    assertEquals(new Set(videos.map((id) => key(id, "poll"))).size, 1);
});

Deno.test("heygen voices: type=public is pinned, free", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("heygen#voices"),
        input: {},
        mode: "replay",
        fixture: await fixture("synthetic-voices-list"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage.credits, {});
    assertEquals((result.output as Record<string, Json>).next_token, "tok-2");
});

Deno.test("heygen voices/clone: provisions the voice, mode instant sent", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("heygen#voices/clone"),
        input: {
            body: {
                name: "Narrator",
                audio: [{ type: "url", url: "https://example.com/me.mp3" }],
            },
        },
        mode: "replay",
        fixture: await fixture("synthetic-voice-clone"),
        resources: [],
    });
    assertEquals(result.httpStatus, 202);
    assertEquals(result.usage.credits, {});
    const seed = result.resources?.provisions?.[0];
    assert(seed !== undefined, "expected a provision seed");
    assertEquals(seed.resource, "heygen/voice");
    assertEquals(seed.externalId, "vc-1");
    assertEquals(seed.data, { name: "Narrator" });
});

Deno.test("heygen voices/delete: owned voice released, foreign voice 404 untouched", async () => {
    const unit = await testSealedUnit("heygen#voices/delete");
    const ok = await runEndpoint({
        unit,
        input: { pathParams: { voice_id: "vc-1" } },
        mode: "replay",
        fixture: await fixture("synthetic-voice-delete"),
        resources: [VOICE],
    });
    assertEquals(ok.httpStatus, 200);
    assertEquals(ok.resources?.releases, [{
        resource: "heygen/voice",
        externalId: "vc-1",
    }]);
    const foreign = await runEndpoint({
        unit,
        input: { pathParams: { voice_id: PUBLIC_VOICE } },
        mode: "replay",
        resources: [VOICE],
    });
    assertEquals(foreign.httpStatus, 404);
});

Deno.test("heygen voices/get: an owned clone is read without a catalog scan", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("heygen#voices/get"),
        input: { pathParams: { voice_id: "vc-1" } },
        mode: "replay",
        fixture: await fixture("synthetic-voice-get"),
        resources: [VOICE],
    });
    assertEquals(result.httpStatus, 200);
});

Deno.test("heygen text-to-speech: owned voice, $0.03 / 1K characters", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("heygen#text-to-speech"),
        input: { body: { voice_id: "vc-1", text: "x".repeat(1000) } },
        mode: "replay",
        fixture: await fixture("synthetic-owned-voice-call"),
        resources: [VOICE],
    });
    assertEquals(result.httpStatus, 200);
    assertAlmostEquals(credits(result), 0.03, EPS);
});

Deno.test("heygen text-to-speech: public voice found in the catalog, Turbo rate", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("heygen#text-to-speech"),
        input: {
            body: {
                model: "heygen-voice-1-turbo",
                voice_id: PUBLIC_VOICE,
                text: "x".repeat(2000),
            },
        },
        mode: "replay",
        fixture: await fixture("synthetic-public-voice-call"),
        resources: [],
    });
    assertEquals(result.httpStatus, 200);
    assertAlmostEquals(credits(result), 0.008, EPS);
});

Deno.test("heygen text-to-speech: another tenant's voice is a 404, zero-billed", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("heygen#text-to-speech"),
        input: { body: { voice_id: "someone-elses", text: "hello" } },
        mode: "replay",
        fixture: await fixture("synthetic-public-voice-miss"),
        resources: [VOICE],
    });
    assertEquals(result.httpStatus, 404);
    assertEquals(result.usage.credits, {});
});

Deno.test("heygen turbo-free: free, the free model refuses a paid model value", async () => {
    const unit = await testSealedUnit("heygen#promo/text-to-speech/turbo-free");
    const result = await runEndpoint({
        unit,
        input: { body: { voice_id: "vc-1", text: "hello" } },
        mode: "replay",
        fixture: await fixture("synthetic-owned-voice-call"),
        resources: [VOICE],
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage.credits, {});
    const paid = await runEndpoint({
        unit,
        input: {
            body: { voice_id: "vc-1", text: "hi", model: "heygen-voice-1" },
        },
        mode: "replay",
        resources: [VOICE],
    }).catch((e: Error) => e);
    assert(
        paid instanceof Error || paid.httpStatus >= 400,
        "model is not an input of the free endpoint",
    );
});

Deno.test("heygen speech-to-speech: billed on the returned duration, 5-minute hold", async () => {
    const unit = await testSealedUnit("heygen#speech-to-speech");
    const input = {
        body: {
            voice_id: "vc-1",
            audio: { type: "url", url: "https://example.com/take.wav" },
        },
    };
    const result = await runEndpoint({
        unit,
        input,
        mode: "replay",
        fixture: await fixture("synthetic-owned-voice-call"),
        resources: [VOICE],
    });
    assertEquals(result.httpStatus, 200);
    // 12.48 s -> 13 billed seconds at $0.002
    assertAlmostEquals(credits(result), 0.026, EPS);
    const loaded = await loadEndpoint({
        unit,
        input,
        mode: "replay",
        resources: [VOICE],
    });
    assertAlmostEquals(
        (await loaded.estimate(input)).credits.default,
        0.6,
        EPS,
    );
});

Deno.test("heygen t2v: 5 s at the 768p default, $0.036/s", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("heygen#v1/video/heygen-video-1-t2v"),
        input: { body: { prompt: "A potter at the wheel." } },
        mode: "replay",
        fixture: await fixture("synthetic-video-5s"),
    });
    assertEquals(result.httpStatus, 200);
    assertAlmostEquals(credits(result), 0.18, EPS);
    assertEquals(
        (result.output as Record<string, Json>).video_url,
        "https://resource2.heygen.ai/videos/vid-1.mp4",
    );
});

Deno.test("heygen i2v: a 20 s clip bills every second at the long rate", async () => {
    const unit = await testSealedUnit("heygen#v1/video/heygen-video-1-i2v");
    const input = {
        body: {
            prompt: "The bowl turns.",
            image: { type: "url", url: "https://example.com/bowl.jpg" },
            duration: "auto",
            resolution: "1080p",
        },
    };
    const result = await runEndpoint({
        unit,
        input,
        mode: "replay",
        fixture: await fixture("synthetic-video-20s"),
    });
    assertAlmostEquals(credits(result), 20 * 0.105, EPS);
    // auto holds the 30 s maximum under the default quality enhancement
    assertAlmostEquals(
        (await estimateEndpoint(unit, input)).credits.default,
        30 * 0.105,
        EPS,
    );
});

Deno.test("heygen r2v: output + reference-video seconds + images after two", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("heygen#v1/video/heygen-video-1-r2v"),
        input: {
            body: {
                prompt: "<Picture 1> on a desk.",
                reference_images: [1, 2, 3].map((n) => ({
                    type: "url",
                    url: `https://example.com/${n}.jpg`,
                })),
                reference_videos: [{
                    type: "url",
                    url: "https://example.com/clip.mp4",
                }],
                duration: 10,
            },
        },
        mode: "replay",
        fixture: await fixture("synthetic-video-r2v"),
    });
    // 10 s + ceil(7.5) = 8 s at $0.10 (768p), one extra image at $0.04
    assertAlmostEquals(credits(result), 1.0 + 0.8 + 0.04, EPS);
});

Deno.test("heygen video: a failed job and a rejected submit are zero-billed", async () => {
    const unit = await testSealedUnit("heygen#v1/video/heygen-video-1-t2v");
    const failed = await runEndpoint({
        unit,
        input: { body: { prompt: "x" } },
        mode: "replay",
        fixture: await fixture("synthetic-video-failed"),
    });
    assertEquals(failed.httpStatus, 500);
    assertEquals(failed.usage.credits, {});
    const rejected = await runEndpoint({
        unit,
        input: { body: { prompt: "x" } },
        mode: "replay",
        fixture: await fixture("synthetic-unauthorized"),
    });
    assertEquals(rejected.httpStatus, 401);
    assertEquals(rejected.usage.credits, {});
});
