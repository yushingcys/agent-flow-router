import { assertEquals, assertRejects } from "@std/assert";
import type { Json } from "@shared/core";
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

Deno.test("iqair: the 2 Monid ids with an API equivalent, per-call billing", async () => {
    const bundle = await testBundle();
    const ids = Object.keys(bundle.endpoints).filter((id) =>
        id.startsWith("iqair#")
    ).sort();
    const urls: Record<string, string> = {
        "iqair#get_city_air_quality": "https://api.airvisual.com/v2/city",
        "iqair#get_live_city_ranking":
            "https://api.airvisual.com/v2/city_ranking",
    };
    assertEquals(ids, Object.keys(urls));
    for (const id of ids) {
        const doc = bundle.endpoints[id];
        assertEquals(doc.request.url, urls[id], id);
        assertEquals(doc.usage.model.kind, "PER_CALL", id);
    }
});

Deno.test("iqair#get_city_air_quality happy (synthetic): key in the query, one call billed", async () => {
    const unit = await testSealedUnit("iqair#get_city_air_quality");
    const result = await runEndpoint({
        unit,
        input: {
            queryParams: {
                city: "Beijing",
                state: "Beijing",
                country: "China",
            },
        },
        mode: "replay",
        fixture: await fixture("synthetic-city-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, {
        credits: { default: 1 },
        evidence: { CALL: 1 },
    });
    const output = result.output as {
        data: { current: { pollution: { aqius: number } } };
    };
    assertEquals(output.data.current.pollution.aqius, 57);
});

Deno.test("iqair#get_live_city_ranking provider error (synthetic 403): data, zero usage", async () => {
    const unit = await testSealedUnit("iqair#get_live_city_ranking");
    const result = await runEndpoint({
        unit,
        input: {},
        mode: "replay",
        fixture: await fixture("synthetic-feature-not-available"),
    });
    assertEquals(result.httpStatus, 403);
    assertEquals(result.isProviderError, true);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals(
        (result.output as { message: string }).message,
        "feature_not_available",
    );
});

Deno.test("iqair#get_city_air_quality: city, state, country required; strict keys", async () => {
    const unit = await testSealedUnit("iqair#get_city_air_quality");
    const synthetic = await fixture("synthetic-city-ok");
    const rejected: Record<string, Json>[] = [
        {},
        { city: "Beijing", state: "Beijing" },
        { city: "", state: "Beijing", country: "China" },
        { city: "Beijing", state: "Beijing", country: "China", key: "k" },
    ];
    for (const queryParams of rejected) {
        await assertRejects(
            () =>
                runEndpoint({
                    unit,
                    input: { queryParams },
                    mode: "replay",
                    fixture: synthetic,
                }),
            Error,
            "INVALID_INPUT",
            JSON.stringify(queryParams),
        );
    }
});

Deno.test({
    name: "iqair#get_city_air_quality live (gated on IQAIR_API_KEY)",
    ignore: liveSkip("iqair"),
    fn: async () => {
        const unit = await testSealedUnit("iqair#get_city_air_quality");
        const result = await runEndpoint({
            unit,
            input: {
                queryParams: {
                    city: "Los Angeles",
                    state: "California",
                    country: "USA",
                },
            },
            mode: "live",
        });
        assertEquals(
            result.isProviderError,
            false,
            JSON.stringify(result.output),
        );
        assertEquals(result.usage.credits, { default: 1 });
    },
});
