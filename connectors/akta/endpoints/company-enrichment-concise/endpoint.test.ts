import { assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";
import { loadFixture, runEndpoint, testSealedUnit } from "@shared/testing";

const fixturesDir = fromFileUrl(new URL("./fixtures/", import.meta.url));

Deno.test("akta#company-enrichment-concise happy (synthetic): flat 3-credit claim", async () => {
    const unit = await testSealedUnit("akta#v1/company/enrichment/concise");
    const fixture = await loadFixture(`${fixturesDir}synthetic-happy.json`);
    const result = await runEndpoint({
        unit,
        input: { queryParams: { company: "https://canva.com" } },
        mode: "replay",
        fixture,
    });
    assertEquals(result.httpStatus, 200);
    // PER_CALL: the engine folds the flat line under the reserved CALL
    // key; the vendor claim (3) agrees with the fold
    assertEquals(result.usage, {
        credits: { default: 3 },
        evidence: { CALL: 1 },
    });
    // billing field absorbed out of the payload
    assertEquals(
        "credits_consumed" in (result.output as Record<string, unknown>),
        false,
    );
});
