import { assertEquals, assertRejects } from "@std/assert";
import { fromFileUrl } from "@std/path";
import { loadFixture, runEndpoint, testSealedUnit } from "@shared/testing";

const fixturesDir = fromFileUrl(new URL("../../fixtures/", import.meta.url));

Deno.test("brave#res/v1/news/search happy (synthetic): one request billed", async () => {
    const unit = await testSealedUnit("brave#res/v1/news/search");
    const fixture = await loadFixture(
        `${fixturesDir}synthetic-news-search-ok.json`,
    );
    const result = await runEndpoint({
        unit,
        input: { queryParams: { q: "open source ai", freshness: "pw" } },
        mode: "replay",
        fixture,
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.isProviderError, false);
    assertEquals(result.usage, {
        credits: { default: 1 },
        evidence: { CALL: 1 },
    });
    const output = result.output as Record<string, unknown>;
    assertEquals((output.results as unknown[]).length, 1);
});

Deno.test("brave#res/v1/news/search: out-of-range input rejected", async () => {
    const unit = await testSealedUnit("brave#res/v1/news/search");
    const fixture = await loadFixture(
        `${fixturesDir}synthetic-news-search-ok.json`,
    );
    await assertRejects(
        () =>
            runEndpoint({
                unit,
                input: { queryParams: { q: "x", count: 51 } },
                mode: "replay",
                fixture,
            }),
        Error,
        "INVALID_INPUT",
    );
});
