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
/** The PNG signature - a pretend image. */
const PNG = { base64: "iVBORw0KGgo=", contentType: "image/png" };

Deno.test("openai: six endpoints under Monid's paths, shared fns", async () => {
    const bundle = await testBundle();
    const ids = Object.keys(bundle.endpoints)
        .filter((id) => id.startsWith("openai#")).sort();
    assertEquals(ids, [
        "openai#v1/image/gpt-image-2",
        "openai#v1/image/gpt-image-2-edit",
        "openai#v1/image/gpt-image-2.5-flare",
        "openai#v1/image/gpt-image-2.5-flare-edit",
        "openai#v1/image/gpt-image-2.5-sunburst",
        "openai#v1/image/gpt-image-2.5-sunburst-edit",
    ]);
    const keys = (pick: (id: string) => string | undefined) =>
        new Set(ids.map(pick).filter((k) => k !== undefined));
    assertEquals(
        keys((id) => bundle.endpoints[id].usage.estimate.$fn.key).size,
        1,
    );
    assertEquals(
        keys((id) => bundle.endpoints[id].lifecycle?.start?.$fn.key).size,
        1,
    );
});

Deno.test("openai#v1/image/gpt-image-2.5-flare: settles on the reported token usage", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("openai#v1/image/gpt-image-2.5-flare"),
        input: { body: { prompt: "a red fox", quality: "high" } },
        mode: "replay",
        fixture: await fixture("synthetic-image-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage.evidence, {
        text_input_token: 20,
        image_input_token: 0,
        image_output_token: 1756,
    });
    assertAlmostEquals(
        result.usage.credits.default,
        20 * 5e-6 + 1756 * 30e-6,
        CENT,
    );
});

Deno.test("openai: a rejected prompt is unbilled", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("openai#v1/image/gpt-image-2"),
        input: { body: { prompt: "x" } },
        mode: "replay",
        fixture: await fixture("synthetic-moderation-blocked"),
    });
    assertEquals(result.httpStatus, 400);
    assertEquals(result.usage.credits, {});
});

Deno.test("openai: the hold follows model, quality, size and n", async () => {
    const out = async (id: string, body: Record<string, unknown>) =>
        (await estimateEndpoint(await testSealedUnit(id), {
            body: { prompt: "abcdefgh", ...body },
        })).evidence;
    assertEquals(
        await out("openai#v1/image/gpt-image-2.5-sunburst", {
            quality: "max",
        }),
        { text_input_token: 2, image_input_token: 0, image_output_token: 7024 },
    );
    // auto holds high; 2048x1024 is twice the area, n = 2 twice again
    assertEquals(
        (await out("openai#v1/image/gpt-image-2", {
            size: "2048x1024",
            n: 2,
        })).image_output_token,
        7024 * 4,
    );
});

Deno.test("openai#v1/image/gpt-image-2-edit: URL sources are fetched and uploaded as files", async () => {
    let form: FormData | undefined;
    const seen: string[] = [];
    const loaded = await new Engine({
        transport: directTransport({
            params: () => Promise.resolve({ apiKey: "k" }),
            fetch: async (url, init) => {
                seen.push(String(url));
                if (String(url).startsWith("https://images.example.com/")) {
                    return new Response(
                        Uint8Array.fromBase64(PNG.base64),
                        { headers: { "content-type": "image/png" } },
                    );
                }
                form = (init as RequestInit).body as FormData;
                const replay = (await fixture("synthetic-image-ok")).calls[0]
                    .res;
                return new Response(JSON.stringify(replay.body), {
                    headers: { "content-type": "application/json" },
                });
            },
        }),
    }).load(await testSealedUnit("openai#v1/image/gpt-image-2-edit"));
    const result = await loaded.run({
        body: {
            prompt: "put them in a basket",
            image: [
                "https://images.example.com/a.png",
                { ...PNG, filename: "b.png" },
            ],
            mask: "https://images.example.com/m.png",
            quality: "low",
        },
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(seen, [
        "https://images.example.com/a.png",
        "https://images.example.com/m.png",
        "https://api.openai.com/v1/images/edits",
    ]);
    assert(form instanceof FormData);
    assertEquals(form.get("model"), "gpt-image-2");
    assertEquals(form.get("quality"), "low");
    assertEquals(
        form.getAll("image[]").map((f) => (f as File).name),
        ["image-0.png", "b.png"],
    );
    assertEquals((form.get("mask") as File).name, "mask.png");
    assertEquals(form.get("image"), null);
});

Deno.test("openai: an edit source that is not an image fails before OpenAI, unbilled", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit(
            "openai#v1/image/gpt-image-2.5-sunburst-edit",
        ),
        input: {
            body: {
                prompt: "x",
                image: ["https://images.example.com/missing.png"],
            },
        },
        mode: "replay",
        fixture: await fixture("synthetic-edit-source-missing"),
    });
    assertEquals(result.httpStatus, 400);
    assertEquals(result.usage.credits, {});
});
