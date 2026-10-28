import { assertEquals, assertRejects } from "@std/assert";
import { fromFileUrl } from "@std/path";
import type { Json } from "@shared/core";
import {
    liveSkip,
    loadFixture,
    runEndpoint,
    testSealedUnit,
} from "@shared/testing";

const ID = "contextdev#web/scrape";
const fixturesDir = fromFileUrl(new URL("./fixtures/", import.meta.url));
const INPUT = {
    body: {
        url: "https://example.com",
        formats: { markdown: true, highlights: true },
        highlightsParams: { query: "what is this domain for?" },
    },
};

Deno.test(`${ID} happy (synthetic): base plus a highlights passage, envelope stripped`, async () => {
    const unit = await testSealedUnit(ID);
    const fixture = await loadFixture(`${fixturesDir}synthetic-happy.json`);
    const result = await runEndpoint({
        unit,
        input: INPUT,
        mode: "replay",
        fixture,
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, {
        credits: { default: 2 },
        evidence: {
            actions_surcharge: 0,
            highlights: 1,
            json: 0,
            product: 0,
            scrape: 1,
        },
    });
    const { key_metadata: _envelope, ...body } = fixture.calls[0].res
        .body as Record<string, Json>;
    assertEquals(result.output, body);
});

Deno.test(`${ID} every modifier (synthetic): actions, highlights, JSON, and product stack, and the vendor agrees`, async () => {
    const unit = await testSealedUnit(ID);
    const fixture = await loadFixture(`${fixturesDir}synthetic-happy.json`);
    const res = fixture.calls[0].res.body as Record<string, Json>;
    res.json = { requested: true, success: true, data: { title: "Example" } };
    res.product = {
        requested: true,
        success: true,
        data: { isProductPage: false, product: null },
    };
    res.key_metadata = { credits_consumed: 8, credits_remaining: 9990 };
    const result = await runEndpoint({
        unit,
        input: {
            body: {
                ...INPUT.body,
                formats: {
                    markdown: true,
                    highlights: true,
                    json: true,
                    product: true,
                },
                jsonParams: {
                    schema: {
                        type: "object",
                        properties: { title: { type: "string" } },
                    },
                },
                sharedParams: {
                    actions: [{ type: "scroll", amount: "max" }],
                },
            },
        },
        mode: "replay",
        fixture,
    });
    // 1 base + 1 actions + 1 highlights + 4 json + 1 product = 8
    assertEquals(result.usage, {
        credits: { default: 8 },
        evidence: {
            actions_surcharge: 1,
            highlights: 1,
            json: 1,
            product: 1,
            scrape: 1,
        },
    });
});

Deno.test(`${ID} failed outputs (synthetic): a requested output that fails adds nothing`, async () => {
    const unit = await testSealedUnit(ID);
    const fixture = await loadFixture(`${fixturesDir}synthetic-happy.json`);
    const res = fixture.calls[0].res.body as Record<string, Json>;
    res.highlights = { requested: true, success: true, data: [] };
    res.json = {
        requested: true,
        success: false,
        data: null,
        error_code: "REQUEST_TIMEOUT",
    };
    res.isPartial = true;
    res.key_metadata = { credits_consumed: 1, credits_remaining: 9997 };
    const result = await runEndpoint({
        unit,
        input: {
            body: {
                ...INPUT.body,
                formats: { markdown: true, highlights: true, json: true },
                jsonParams: { schema: { type: "object" } },
            },
        },
        mode: "replay",
        fixture,
    });
    assertEquals(result.usage, {
        credits: { default: 1 },
        evidence: {
            actions_surcharge: 0,
            highlights: 0,
            json: 0,
            product: 0,
            scrape: 1,
        },
    });
});

Deno.test(`${ID} provider error (synthetic 400): zero usage`, async () => {
    const unit = await testSealedUnit(ID);
    const fixture = await loadFixture(
        `${fixturesDir}synthetic-provider-error.json`,
    );
    const result = await runEndpoint({
        unit,
        input: INPUT,
        mode: "replay",
        fixture,
    });
    assertEquals(result.httpStatus, 400);
    assertEquals(result.isProviderError, true);
    assertEquals(result.usage, { credits: {}, evidence: {} });
});

Deno.test(`${ID}: url and formats are required; params are strict`, async () => {
    const unit = await testSealedUnit(ID);
    const fixture = await loadFixture(`${fixturesDir}synthetic-happy.json`);
    const run = (body: Record<string, unknown>) =>
        runEndpoint({
            unit,
            input: { body: body as Record<string, Json> },
            mode: "replay",
            fixture,
        });
    const base = { url: "https://example.com", formats: { markdown: true } };
    for (
        const bad of [
            { url: "https://example.com" },
            { formats: { markdown: true } },
            { url: "example.com", formats: { markdown: true } },
            { ...base, formats: { pdf: true } },
            { ...base, parseParams: { type: "prebuilt", parser: "yelp" } },
            { ...base, sharedParams: { actions: [] } },
            { ...base, sharedParams: { actions: [{ type: "click" }] } },
            {
                ...base,
                sharedParams: {
                    profile: { type: "existing", profileId: "prof_x" },
                },
            },
            { ...base, timeoutOpts: { milliseconds: 300001 } },
            { ...base, tags: ["x"] },
        ]
    ) {
        await assertRejects(() => run(bad), Error, "INVALID_INPUT");
    }
    const twin = await run({
        ...base,
        parseParams: {
            type: "prebuilt",
            parser: "google-maps-reviews",
            sort: "oldest",
            limit: 1000,
        },
        screenshotParams: { area: { selector: "#main" }, format: "webp" },
        sharedParams: {
            country: "us",
            waitFor: ".loaded",
            actions: [{ type: "perform", action: "Click 'Accept'" }],
            parsers: { pdf: { startPage: 1, ocr: "auto" } },
        },
        timeoutOpts: { milliseconds: 300000, behavior: "return-partial" },
    });
    assertEquals(twin.httpStatus, 200);
    const custom = await run({
        ...base,
        formats: { parse: true },
        parseParams: {
            rules: {
                title: "h1",
                links: { selector: "a", type: "list", output: "@href" },
            },
        },
    });
    assertEquals(custom.httpStatus, 200);
});

Deno.test({
    name: `${ID} live (gated on CONTEXTDEV_API_KEY)`,
    ignore: liveSkip("contextdev"),
    fn: async () => {
        const unit = await testSealedUnit(ID);
        const result = await runEndpoint({
            unit,
            input: INPUT,
            mode: "live",
        });
        assertEquals(
            result.isProviderError,
            false,
            JSON.stringify(result.output),
        );
        assertEquals(
            Object.keys(result.usage.evidence).sort(),
            ["actions_surcharge", "highlights", "json", "product", "scrape"],
        );
        assertEquals(
            (result.output as { markdown: { success: unknown } }).markdown
                .success,
            true,
            JSON.stringify(result.output),
        );
    },
});
