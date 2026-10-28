import { assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";
import { loadFixture, runEndpoint, testSealedUnit } from "@shared/testing";

const fixturesDir = fromFileUrl(new URL("./fixtures/", import.meta.url));

Deno.test("akta#social-posts happy (synthetic): limit 3 bills one started block of 10", async () => {
    const unit = await testSealedUnit("akta#v1/company/posts");
    const fixture = await loadFixture(`${fixturesDir}synthetic-happy.json`);
    const result = await runEndpoint({
        unit,
        input: { queryParams: { company: "canva.com", limit: 3 } },
        mode: "replay",
        fixture,
    });
    assertEquals(result.httpStatus, 200);
    // ceil(3 / 10) x 1 credit = 1, matching the claim
    assertEquals(result.usage, {
        credits: { default: 1 },
        evidence: { RESULT: 3 },
    });
    // billing field absorbed out of the payload
    assertEquals(
        "credits_consumed" in (result.output as Record<string, unknown>),
        false,
    );
});
