import { assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";
import { loadFixture, runEndpoint, testSealedUnit } from "@shared/testing";

const fixturesDir = fromFileUrl(new URL("./fixtures/", import.meta.url));

Deno.test("akta#news-by-id happy (synthetic): flat request + per-article composite", async () => {
    const unit = await testSealedUnit("akta#v1/news/by-id");
    const fixture = await loadFixture(`${fixturesDir}synthetic-happy.json`);
    const result = await runEndpoint({
        unit,
        input: { queryParams: { news_ids: ["34144849", "34186756"] } },
        mode: "replay",
        fixture,
    });
    assertEquals(result.httpStatus, 200);
    // ids go comma-separated on the wire (the fixture URL proves it);
    // 0.1 + 2 x 0.01 agrees with the 0.12 claim within 1e-9
    assertEquals(result.usage, {
        credits: { default: 0.12 },
        evidence: { article: 2, request: 1 },
    });
    // billing field absorbed out of the payload
    assertEquals(
        "credits_consumed" in (result.output as Record<string, unknown>),
        false,
    );
});
