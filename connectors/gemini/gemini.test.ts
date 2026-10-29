import { assert, assertAlmostEquals, assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";
import type { Json } from "@shared/core";
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
const TEXT = { type: "text", text: "the cat stretches and yawns" };
const IMAGE = { type: "image", uri: "https://images.example.com/cat.png" };
const VIDEO = { type: "video", uri: "https://videos.example.com/clip.mp4" };

/** One minimal valid body per Omni endpoint. */
const BODIES: Record<string, Json> = {
    "gemini#v1/video/omni-flash-t2v": { input: "a marble run" },
    "gemini#v1/video/omni-flash-i2v": { input: [IMAGE, TEXT] },
    "gemini#v1/video/omni-flash-r2v": { input: [IMAGE, VIDEO, TEXT] },
    "gemini#v1/video/omni-flash-edit": { input: [VIDEO, TEXT] },
    "gemini#v1/video/omni-flash-extend": { input: [VIDEO, TEXT] },
};

Deno.test("gemini: five Omni endpoints under Monid's paths plus the file reader, shared fns", async () => {
    const bundle = await testBundle();
    const ids = Object.keys(bundle.endpoints)
        .filter((id) => id.startsWith("gemini#")).sort();
    assertEquals(ids, [
        "gemini#v1/video/omni-flash-edit",
        "gemini#v1/video/omni-flash-extend",
        "gemini#v1/video/omni-flash-i2v",
        "gemini#v1/video/omni-flash-r2v",
        "gemini#v1/video/omni-flash-t2v",
        "gemini#v1beta/files/{file}/download",
    ]);
    const omni = Object.keys(BODIES);
    for (
        const pick of [
            (id: string) => bundle.endpoints[id].lifecycle?.start?.$fn.key,
            (id: string) => bundle.endpoints[id].lifecycle?.poll?.$fn.key,
            (id: string) => bundle.endpoints[id].usage.estimate.$fn.key,
        ]
    ) assertEquals(new Set(omni.map(pick)).size, 1);
});

Deno.test("gemini: every Omni endpoint runs the background chain and settles on usage", async () => {
    for (const [id, body] of Object.entries(BODIES)) {
        const result = await runEndpoint({
            unit: await testSealedUnit(id),
            input: { body },
            mode: "replay",
            fixture: await fixture("synthetic-interaction-completed"),
        });
        assertEquals(result.httpStatus, 200, id);
        assertEquals(result.usage.evidence, {
            input_token: 120,
            text_output_token: 300,
            video_output_token: 46336,
        }, id);
        assertAlmostEquals(
            result.usage.credits.default,
            120 * 1.5e-6 + 300 * 9e-6 + 46336 * 17.5e-6,
            CENT,
            id,
        );
        const video = (result.output as Record<string, Json>).video;
        assertEquals(video, {
            uri: "https://generativelanguage.googleapis.com/v1beta/files/" +
                "omnivid123:download?alt=media",
            file: "omnivid123",
            mime_type: "video/mp4",
        }, id);
    }
});

Deno.test("gemini: the wire body runs in the background with the endpoint's task", async () => {
    const sent: Json[] = [];
    const run = async (id: string, body: Json) => {
        const loaded = await new Engine({
            transport: directTransport({
                params: () => Promise.resolve({ apiKey: "k" }),
                fetch: (_url, init) => {
                    sent.push(JSON.parse(String((init as RequestInit).body)));
                    return Promise.resolve(
                        new Response(JSON.stringify({ error: { code: 400 } }), {
                            status: 400,
                            headers: { "content-type": "application/json" },
                        }),
                    );
                },
            }),
        }).load(await testSealedUnit(id));
        return await loaded.run({ body });
    };
    await run(
        "gemini#v1/video/omni-flash-r2v",
        BODIES["gemini#v1/video/omni-flash-r2v"],
    );
    assertEquals(sent[0], {
        model: "gemini-omni-1.1-flash",
        input: [IMAGE, VIDEO, TEXT],
        response_format: { type: "video", resolution: "720p", delivery: "uri" },
        generation_config: { video_config: { task: "reference_to_video" } },
        background: true,
    });
    // a chained edit drops the explicit task, keeping the rest of the config
    await run("gemini#v1/video/omni-flash-edit", {
        input: [TEXT],
        previous_interaction_id: "v1_prev",
        generation_config: { thinking_level: "low" },
    });
    const chained = sent[1] as Record<string, Json>;
    assertEquals(chained.previous_interaction_id, "v1_prev");
    assertEquals(chained.generation_config, { thinking_level: "low" });
});

Deno.test("gemini: a failed interaction and a rejected create are unbilled", async () => {
    const id = "gemini#v1/video/omni-flash-t2v";
    for (
        const name of [
            "synthetic-interaction-failed",
            "synthetic-create-rejected",
        ]
    ) {
        const result = await runEndpoint({
            unit: await testSealedUnit(id),
            input: { body: BODIES[id] },
            mode: "replay",
            fixture: await fixture(name),
        });
        assert(result.httpStatus >= 400, name);
        assertEquals(result.usage.credits, {}, name);
    }
});

Deno.test("gemini: the hold follows resolution and duration", async () => {
    const tokens = async (id: string, response_format: Json) =>
        (await estimateEndpoint(await testSealedUnit(id), {
            body: { ...(BODIES[id] as Record<string, Json>), response_format },
        })).evidence.video_output_token;
    assertEquals(await tokens("gemini#v1/video/omni-flash-t2v", {}), 57920);
    assertEquals(
        await tokens("gemini#v1/video/omni-flash-t2v", {
            resolution: "4k",
            duration: "4s",
        }),
        4 * 16323,
    );
    // an extension returns the source too, so it holds 10 s more
    assertEquals(
        await tokens("gemini#v1/video/omni-flash-extend", { duration: "5s" }),
        15 * 5792,
    );
});

Deno.test("gemini#v1beta/files/{file}/download: a redirect is a url, bytes are base64", async () => {
    const unit = await testSealedUnit("gemini#v1beta/files/{file}/download");
    const input = { pathParams: { file: "omnivid123" } };
    const redirect = await runEndpoint({
        unit,
        input,
        mode: "replay",
        fixture: await fixture("synthetic-download-redirect"),
    });
    assertEquals(redirect.httpStatus, 200);
    assertEquals(redirect.output, {
        url: "https://storage.example.com/omnivid123.mp4?sig=placeholder",
    });
    assertEquals(redirect.usage.credits, {});
    const bytes = await runEndpoint({
        unit,
        input,
        mode: "replay",
        fixture: await fixture("synthetic-download-bytes"),
    });
    assertEquals(bytes.httpStatus, 200);
    assertEquals(bytes.output, {
        contentType: "video/mp4",
        base64: "AAAAIGZ0eXBpc29t",
    });
});
