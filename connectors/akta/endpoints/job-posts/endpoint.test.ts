import { assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";
import { loadFixture, runEndpoint, testSealedUnit } from "@shared/testing";

const fixturesDir = fromFileUrl(new URL("./fixtures/", import.meta.url));

Deno.test("akta#job-posts happy (synthetic): limit 12 bills two started blocks of 10", async () => {
    const unit = await testSealedUnit("akta#v1/company/jobs");
    const fixture = await loadFixture(`${fixturesDir}synthetic-happy.json`);
    const result = await runEndpoint({
        unit,
        input: { queryParams: { company: "canva.com", limit: 12 } },
        mode: "replay",
        fixture,
    });
    assertEquals(result.httpStatus, 200);
    // ceil(12 / 10) x 4 credits = 8, matching the claim
    assertEquals(result.usage, {
        credits: { default: 8 },
        evidence: { RESULT: 12 },
    });
    // billing field absorbed out of the payload
    assertEquals(
        "credits_consumed" in (result.output as Record<string, unknown>),
        false,
    );
});
