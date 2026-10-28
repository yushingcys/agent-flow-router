import { assert, assertEquals, assertRejects } from "@std/assert";
import { fromFileUrl } from "@std/path";
import type { Json, RunInput } from "@shared/core";
import {
    estimateEndpoint,
    liveSkip,
    loadFixture,
    replayFetch,
    runEndpoint,
    testBundle,
    testSealedUnit,
} from "@shared/testing";
import { directTransport, Engine } from "@agent-flow/connector-engine";

/**
 * THE topaz suite. Two shared chains serve every endpoint: one for the
 * image API (multipart submit, status, download) and one for the video API
 * (create, accept, status). ALL chains are SYNTHETIC: no Topaz key was
 * available on 2026-10-27, so bodies follow the vendor OpenAPI shapes.
 * Replace the `*-succeeded` chains with `deno task record` output once a
 * key exists.
 *
 * The run settles on Topaz's own billed figure (image `credits`, video the
 * lower bound of `estimates.cost`), so the happy chains settle the same
 * credits for every endpoint of an API; what differs per endpoint is the
 * pre-run hold, pinned below as a LITERAL table typed by hand from the
 * vendor's published rates, never re-derived from the code under test.
 */

const HERE = fromFileUrl(new URL("./", import.meta.url));
const INPUTS = JSON.parse(
    await Deno.readTextFile(`${HERE}test-inputs.json`),
) as Record<string, Record<string, Json>>;

/** Monid's 23 Topaz paths (monid.ai/tools/topaz, 2026-10-27). */
const MONID_PATHS = [
    "image/denoise",
    "image/denoise-generative",
    "image/lighting",
    "image/remove-background",
    "image/restore",
    "image/sharpen",
    "image/sharpen-generative",
    "image/upscale",
    "image/upscale-creative",
    "image/upscale-generative",
    "image/upscale-transparent",
    "video/colorize",
    "video/deblur",
    "video/deinterlace",
    "video/denoise",
    "video/fix-artifacts",
    "video/frame-interpolation",
    "video/recover-faces",
    "video/sdr-to-hdr",
    "video/upscale",
    "video/upscale-animation",
    "video/upscale-creative",
    "video/upscale-generative",
];

/**
 * Credits held for each test input. Image: ceil(output MP / MP per credit),
 * 8000x6000 = 48 MP on the four resizing tools (Gigapixel 24 -> 2, Wonder
 * 3.5 8 -> 6, Bloom 2 -> 24, transparent 24 -> 2); tools that keep the
 * input size hold 1. Video: 300 output frames at 1080p over the model's
 * frames per credit (Proteus family 237 -> 2, Gaia 2 300 -> 1, Nyx /
 * Themis / colorize 518 -> 1, Hyperion 2.5 13.02 -> 24, Starlight Precise
 * 26.04 -> 12, Astra 2 10 -> 30); Apollo at 2x slow motion renders 600
 * frames at 252 -> 3.
 */
const HOLD: Record<string, number> = {
    "image/upscale": 2,
    "image/upscale-generative": 6,
    "image/upscale-creative": 24,
    "image/upscale-transparent": 2,
    "image/sharpen": 1,
    "image/sharpen-generative": 1,
    "image/denoise": 1,
    "image/denoise-generative": 1,
    "image/restore": 1,
    "image/lighting": 1,
    "image/remove-background": 1,
    "video/upscale": 2,
    "video/fix-artifacts": 2,
    "video/deinterlace": 2,
    "video/upscale-animation": 1,
    "video/recover-faces": 2,
    "video/denoise": 1,
    "video/deblur": 1,
    "video/colorize": 1,
    "video/sdr-to-hdr": 24,
    "video/frame-interpolation": 3,
    "video/upscale-generative": 12,
    "video/upscale-creative": 30,
};

const ids = async (prefix: string): Promise<string[]> =>
    Object.keys((await testBundle()).endpoints)
        .filter((id) => id.startsWith(`topaz#${prefix}`))
        .sort();

const inputFor = (id: string): RunInput => {
    const body = INPUTS[id.split("#")[1]];
    assert(body !== undefined, `${id}: no test input in test-inputs.json`);
    return { body };
};

const run = async (id: string, fixture: string, input = inputFor(id)) =>
    runEndpoint({
        unit: await testSealedUnit(id),
        input,
        mode: "replay",
        fixture: await loadFixture(`${HERE}fixtures/${fixture}.json`),
    });

Deno.test("topaz: the endpoint ids are exactly Monid's paths", async () => {
    assertEquals(await ids(""), MONID_PATHS.map((p) => `topaz#${p}`));
    assertEquals(Object.keys(HOLD).sort(), MONID_PATHS);
});

Deno.test("topaz: every image endpoint completes the shared chain on Topaz's billed credits", async () => {
    for (const id of await ids("image/")) {
        const result = await run(id, "synthetic-image-succeeded");
        assertEquals(result.httpStatus, 200, id);
        assertEquals(result.usage, {
            credits: { default: 2 },
            evidence: { CREDIT: 2 },
        }, id);
        const output = result.output as Record<string, Json>;
        assertEquals(output.status, "Completed", id);
        const download = output.download as Record<string, string>;
        assert(download.download_url.startsWith("https://"), id);
        assertEquals(result.timing.attempts, 2, id);
    }
});

Deno.test("topaz: every video endpoint completes the shared chain on the cost lower bound", async () => {
    for (const id of await ids("video/")) {
        const result = await run(id, "synthetic-video-succeeded");
        assertEquals(result.httpStatus, 200, id);
        assertEquals(result.usage, {
            credits: { default: 4 },
            evidence: { CREDIT: 4 },
        }, id);
        const output = result.output as Record<string, Json>;
        assertEquals(output.status, "complete", id);
        assertEquals(output.requestId, "5d6e7f80-91a2-4b3c-8d4e-5f60718293a4");
        const download = output.download as Record<string, string>;
        assert(download.url.startsWith("https://"), id);
    }
});

Deno.test("topaz: the hold is the vendor rate over the requested output", async () => {
    for (const path of MONID_PATHS) {
        const id = `topaz#${path}`;
        const estimate = await estimateEndpoint(
            await testSealedUnit(id),
            inputFor(id),
        );
        assertEquals(estimate, {
            credits: { default: HOLD[path] },
            evidence: { CREDIT: HOLD[path] },
        }, id);
    }
    const hold = async (id: string, body: Record<string, Json>) =>
        (await estimateEndpoint(await testSealedUnit(id), { body }))
            .credits.default;
    // one output side is held as a square of it: 10000^2 = 100 MP / 24
    assertEquals(
        await hold("topaz#image/upscale", {
            source_url: "https://example.test/a.jpg",
            output_width: 10000,
        }),
        5,
    );
    // Relight Creative is priced at 4 MP per credit, not the family's 24
    assertEquals(
        await hold("topaz#image/lighting", {
            source_url: "https://example.test/a.jpg",
            model: "Relight Creative V1",
        }),
        1,
    );
    // 4K output: 300 frames at Proteus's 59.6 per credit (Topaz: 10 s of
    // 4K = 6 credits)
    const video = INPUTS["video/upscale"];
    assertEquals(
        await hold("topaz#video/upscale", {
            ...video,
            output: {
                ...(video.output as Record<string, Json>),
                resolution: { width: 3840, height: 2160 },
            },
        }),
        6,
    );
});

Deno.test("topaz: the image submit leaves as a multipart form, the polls bare", async () => {
    const id = "topaz#image/upscale";
    const unit = await testSealedUnit(id);
    const url = unit.doc.request.url;
    const replay = replayFetch(
        await loadFixture(`${HERE}fixtures/synthetic-image-succeeded.json`),
        { "request.url": url, "request.origin": new URL(url).origin },
    );
    const sent: RequestInit[] = [];
    const engine = new Engine({
        transport: directTransport({
            params: () => Promise.resolve({ apiKey: "test-key" }),
            fetch: (input, init) => {
                sent.push(init ?? {});
                return replay(input, init);
            },
        }),
        sleep: () => Promise.resolve(),
    });
    const result = await (await engine.load(unit)).run(inputFor(id));
    assertEquals(result.httpStatus, 200);
    // fetch writes the multipart content type (with its boundary) itself
    assertEquals(sent[0].headers, { "X-API-Key": "test-key" });
    const form = sent[0].body as FormData;
    assert(form instanceof FormData);
    assertEquals(Object.fromEntries(form.entries()), {
        source_url: "https://example.test/photo.jpg",
        output_width: "8000",
        output_height: "6000",
        model: "Standard V2",
    });
    assertEquals(sent.slice(1).map((init) => init.body), [
        undefined,
        undefined,
        undefined,
    ]);
});

Deno.test("topaz: a failed image job is a synthesized 500 with zero usage", async () => {
    const result = await run("topaz#image/upscale", "synthetic-image-failed");
    assertEquals(result.httpStatus, 500);
    assertEquals(result.isProviderError, true);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals((result.output as Record<string, Json>).status, "Failed");
});

Deno.test("topaz: a refused image submit is DATA with zero usage", async () => {
    const result = await run(
        "topaz#image/denoise",
        "synthetic-image-submit-rejected",
    );
    assertEquals(result.httpStatus, 402);
    assertEquals(result.usage, { credits: {}, evidence: {} });
});

Deno.test("topaz: a refused video accept is DATA with zero usage", async () => {
    const result = await run(
        "topaz#video/upscale",
        "synthetic-video-accept-rejected",
    );
    assertEquals(result.httpStatus, 402);
    assertEquals(result.usage, { credits: {}, evidence: {} });
});

Deno.test("topaz: a failed video request is a synthesized 500 with zero usage", async () => {
    const result = await run("topaz#video/denoise", "synthetic-video-failed");
    assertEquals(result.httpStatus, 500);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    const output = result.output as Record<string, Json>;
    assertEquals(output.errorCode, "PROCESSING_FAILURE");
});

Deno.test("topaz: a failing status GET throws rather than abandoning a paid job", async () => {
    for (
        const [id, fixture] of [
            ["topaz#image/sharpen", "synthetic-image-poll-failed"],
            ["topaz#video/deblur", "synthetic-video-poll-failed"],
        ]
    ) {
        await assertRejects(() => run(id, fixture), Error, "503");
    }
});

Deno.test("topaz: the lifecycle and estimate fns are shared, one fnTable entry each", async () => {
    const bundle = await testBundle();
    const keys = (prefix: string, pick: (d: Json) => Json) =>
        new Set(
            Object.values(bundle.endpoints)
                .filter((d) => d.id.startsWith(`topaz#${prefix}`))
                .map((d) => JSON.stringify(pick(d as unknown as Json))),
        );
    for (const prefix of ["image/", "video/"]) {
        const lifecycle = keys(
            prefix,
            (d) => (d as Record<string, Json>).lifecycle,
        );
        const estimate = keys(
            prefix,
            (d) =>
                ((d as Record<string, Json>).usage as Record<string, Json>)
                    .estimate,
        );
        assertEquals(lifecycle.size, 1, prefix);
        assertEquals(estimate.size, 1, prefix);
    }
});

Deno.test({
    name: "topaz: live 2x upscale of a small public image",
    ignore: liveSkip("topaz"),
    fn: async () => {
        const result = await runEndpoint({
            unit: await testSealedUnit("topaz#image/upscale"),
            input: {
                body: {
                    source_url:
                        "https://upload.wikimedia.org/wikipedia/commons/a/a9/Example.jpg",
                    output_width: 550,
                },
            },
            mode: "live",
        });
        assertEquals(result.httpStatus, 200);
        assertEquals(result.usage.credits.default, 1);
    },
});
