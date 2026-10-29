import { assertEquals, assertRejects } from "@std/assert";
import { fromFileUrl } from "@std/path";
import {
    liveSkip,
    loadFixture,
    runEndpoint,
    testBundle,
    testSealedUnit,
} from "@shared/testing";

const fixtures = fromFileUrl(new URL("./fixtures/", import.meta.url));
const fixture = (name: string) => loadFixture(`${fixtures}${name}.json`);

/** Monid id -> the V2 Data API route it calls. */
const ROUTES: Record<string, string> = {
    "get_models_list": "/language/models/free",
    "get_model_detail": "/language/models/{slug}",
    "get_llm_providers_leaderboard": "/language/providers",
    "get_speech_image_video_models": "/media/{media_type}/models/free",
};

Deno.test("artificial-analysis: Monid ids, x-api-key auth, all FREE", async () => {
    const bundle = await testBundle();
    const ids = Object.keys(bundle.endpoints).filter((id) =>
        id.startsWith("artificial-analysis#")
    ).sort();
    assertEquals(
        ids,
        Object.keys(ROUTES).map((p) => `artificial-analysis#${p}`).sort(),
    );
    for (const id of ids) {
        const doc = bundle.endpoints[id];
        assertEquals(
            doc.request.url,
            "https://artificialanalysis.ai/api/v2" +
                ROUTES[id.slice("artificial-analysis#".length)],
            id,
        );
        assertEquals(doc.request.method, "GET", id);
        assertEquals(doc.usage.model.kind, "FREE", id);
    }
});

Deno.test("artificial-analysis#get_models_list happy (synthetic): free, page passed", async () => {
    const unit = await testSealedUnit("artificial-analysis#get_models_list");
    const result = await runEndpoint({
        unit,
        input: { queryParams: { page: 2 } },
        mode: "replay",
        fixture: await fixture("synthetic-models-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals((result.output as { data: unknown[] }).data.length, 1);
});

Deno.test("artificial-analysis#get_speech_image_video_models (synthetic): media_type routes", async () => {
    const unit = await testSealedUnit(
        "artificial-analysis#get_speech_image_video_models",
    );
    const ok = await fixture("synthetic-media-ok");
    const result = await runEndpoint({
        unit,
        input: { pathParams: { media_type: "text-to-speech" } },
        mode: "replay",
        fixture: ok,
    });
    assertEquals(result.httpStatus, 200);
    await assertRejects(
        () =>
            runEndpoint({
                unit,
                input: { pathParams: { media_type: "music" } },
                mode: "replay",
                fixture: ok,
            }),
        Error,
        "INVALID_INPUT",
    );
});

Deno.test("artificial-analysis#get_model_detail tier 403 (synthetic): data, error message lifted", async () => {
    const unit = await testSealedUnit("artificial-analysis#get_model_detail");
    const result = await runEndpoint({
        unit,
        input: { pathParams: { slug: "glm-5-3" } },
        mode: "replay",
        fixture: await fixture("synthetic-tier-forbidden"),
    });
    assertEquals(result.httpStatus, 403);
    assertEquals(result.isProviderError, true);
    assertEquals(
        (result.output as { message: string }).message,
        "Language model detail requires a Pro subscription",
    );
});

Deno.test({
    name:
        "artificial-analysis#get_models_list live (gated on ARTIFICIAL_ANALYSIS_API_KEY)",
    ignore: liveSkip("artificial-analysis"),
    fn: async () => {
        const unit = await testSealedUnit(
            "artificial-analysis#get_models_list",
        );
        const result = await runEndpoint({ unit, input: {}, mode: "live" });
        assertEquals(
            result.isProviderError,
            false,
            JSON.stringify(result.output),
        );
    },
});
