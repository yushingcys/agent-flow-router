import { assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";
import { loadFixture, runEndpoint, testSealedUnit } from "@shared/testing";

const fixturesDir = fromFileUrl(new URL("./fixtures/", import.meta.url));

Deno.test("akta#headcount-trends happy (synthetic): flat 2.5-credit claim", async () => {
    const unit = await testSealedUnit("akta#v1/company/headcount-trends");
    const fixture = await loadFixture(`${fixturesDir}synthetic-happy.json`);
    const result = await runEndpoint({
        unit,
        input: { queryParams: { company: "canva.com" } },
        mode: "replay",
        fixture,
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, {
        credits: { default: 2.5 },
        evidence: { CALL: 1 },
    });
    // billing field absorbed out of the payload
    assertEquals(
        "credits_consumed" in (result.output as Record<string, unknown>),
        false,
    );
});
