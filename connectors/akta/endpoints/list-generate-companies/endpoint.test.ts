import { assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";
import { loadFixture, runEndpoint, testSealedUnit } from "@shared/testing";

const fixturesDir = fromFileUrl(new URL("./fixtures/", import.meta.url));

Deno.test("akta#list-generate-companies happy (synthetic): JSON body; base + per-company composite", async () => {
    const unit = await testSealedUnit("akta#v1/list/generate/companies");
    const fixture = await loadFixture(`${fixturesDir}synthetic-happy.json`);
    const result = await runEndpoint({
        unit,
        input: {
            body: {
                filters: {
                    "location.hq.country": ["USA"],
                    "business_model.offering_type": ["software"],
                },
                limit: 3,
            },
        },
        mode: "replay",
        fixture,
    });
    assertEquals(result.httpStatus, 200);
    // 1.5 base + 3 x 0.2 per company delivered = 2.1, matching the claim
    assertEquals(result.usage, {
        credits: { default: 2.1 },
        evidence: { company: 3, request: 1 },
    });
    // billing field absorbed out of the payload
    assertEquals(
        "credits_consumed" in (result.output as Record<string, unknown>),
        false,
    );
});
