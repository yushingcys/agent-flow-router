import { assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";
import { loadFixture, runEndpoint, testSealedUnit } from "@shared/testing";

const fixturesDir = fromFileUrl(new URL("./fixtures/", import.meta.url));

Deno.test("akta#company-enrichment-markdown happy (synthetic): per-section composite read off sections_included", async () => {
    const unit = await testSealedUnit("akta#v1/company/enrichment/markdown");
    const fixture = await loadFixture(`${fixturesDir}synthetic-happy.json`);
    const result = await runEndpoint({
        unit,
        input: {
            queryParams: {
                company: "https://canva.com",
                sections: ["firmographic", "business_model"],
            },
        },
        mode: "replay",
        fixture,
    });
    assertEquals(result.httpStatus, 200);
    // 2 + 2 credits; evidence keys are the rendered sections
    assertEquals(result.usage, {
        credits: { default: 4 },
        evidence: { firmographic: 1, business_model: 1 },
    });
    // billing field absorbed out of the payload
    assertEquals(
        "credits_consumed" in (result.output as Record<string, unknown>),
        false,
    );
});
