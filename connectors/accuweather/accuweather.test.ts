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
const ORIGIN = "https://dataservice.accuweather.com";

Deno.test("accuweather: Monid's 3 ids, real API urls, per-call billing", async () => {
    const bundle = await testBundle();
    const ids = Object.keys(bundle.endpoints).filter((id) =>
        id.startsWith("accuweather#")
    ).sort();
    const urls: Record<string, string> = {
        "accuweather#get_weather":
            `${ORIGIN}/currentconditions/v1/{locationKey}`,
        "accuweather#list_cities": `${ORIGIN}/locations/v1/topcities/{group}`,
        "accuweather#search_locations": `${ORIGIN}/locations/v1/search`,
    };
    assertEquals(ids, Object.keys(urls));
    for (const id of ids) {
        const doc = bundle.endpoints[id];
        assertEquals(doc.request.url, urls[id], id);
        assertEquals(doc.usage.model.kind, "PER_CALL", id);
    }
});

Deno.test("accuweather#search_locations happy (synthetic): one call billed", async () => {
    const unit = await testSealedUnit("accuweather#search_locations");
    const result = await runEndpoint({
        unit,
        input: { queryParams: { q: "London" } },
        mode: "replay",
        fixture: await fixture("synthetic-search-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, {
        credits: { default: 1 },
        evidence: { CALL: 1 },
    });
    assertEquals((result.output as { Key: string }[])[0].Key, "328328");
});

Deno.test("accuweather#get_weather happy (synthetic): two calls, one output, two billed", async () => {
    const unit = await testSealedUnit("accuweather#get_weather");
    const result = await runEndpoint({
        unit,
        input: {
            pathParams: { locationKey: "349727" },
            queryParams: { language: "en-us", metric: true },
        },
        mode: "replay",
        fixture: await fixture("synthetic-weather-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, {
        credits: { default: 2 },
        evidence: { CALL: 1 },
    });
    const output = result.output as {
        current: { WeatherText: string };
        forecast: { DailyForecasts: unknown[] };
    };
    assertEquals(output.current.WeatherText, "Partly sunny");
    assertEquals(output.forecast.DailyForecasts.length, 1);
});

Deno.test("accuweather#get_weather: forecast failure is data, zero usage", async () => {
    const unit = await testSealedUnit("accuweather#get_weather");
    const result = await runEndpoint({
        unit,
        input: { pathParams: { locationKey: "349727" } },
        mode: "replay",
        fixture: await fixture("synthetic-forecast-unauthorized"),
    });
    assertEquals(result.httpStatus, 403);
    assertEquals(result.isProviderError, true);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals(
        (result.output as { message: string }).message,
        "Api Authorization failed",
    );
});

Deno.test("accuweather: invalid inputs rejected before the wire", async () => {
    const synthetic = await fixture("synthetic-search-ok");
    const search = await testSealedUnit("accuweather#search_locations");
    const rejected: Record<string, Json>[] = [
        {},
        { q: "" },
        { q: "x", apikey: "k" },
        { q: "x", alias: 3 },
    ];
    for (const queryParams of rejected) {
        await assertRejects(
            () =>
                runEndpoint({
                    unit: search,
                    input: { queryParams },
                    mode: "replay",
                    fixture: synthetic,
                }),
            Error,
            "INVALID_INPUT",
            JSON.stringify(queryParams),
        );
    }
    const cities = await testSealedUnit("accuweather#list_cities");
    await assertRejects(
        () =>
            runEndpoint({
                unit: cities,
                input: { pathParams: { group: "75" } },
                mode: "replay",
                fixture: synthetic,
            }),
        Error,
        "INVALID_INPUT",
    );
});

Deno.test({
    name: "accuweather#get_weather live (gated on ACCUWEATHER_API_KEY)",
    ignore: liveSkip("accuweather"),
    fn: async () => {
        const unit = await testSealedUnit("accuweather#get_weather");
        const result = await runEndpoint({
            unit,
            input: { pathParams: { locationKey: "349727" } },
            mode: "live",
        });
        assertEquals(
            result.isProviderError,
            false,
            JSON.stringify(result.output),
        );
        assertEquals(result.usage.credits, { default: 2 });
    },
});
