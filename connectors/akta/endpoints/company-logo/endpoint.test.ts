import { assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";
import { loadFixture, runEndpoint, testSealedUnit } from "@shared/testing";

const fixturesDir = fromFileUrl(new URL("./fixtures/", import.meta.url));

Deno.test("akta#company-logo happy (synthetic): free lookup - zero usage", async () => {
    const unit = await testSealedUnit(
        "akta#v1/company/enrichment/logo/{company}",
    );
    const fixture = await loadFixture(`${fixturesDir}synthetic-happy.json`);
    const result = await runEndpoint({
        unit,
        input: { pathParams: { company: "canva.com" } },
        mode: "replay",
        fixture,
    });
    assertEquals(result.httpStatus, 200);
    // FREE: the vendor's present 0 prunes to an empty claim
    assertEquals(result.usage, { credits: {}, evidence: {} });
    // billing field absorbed out of the payload
    assertEquals(
        "credits_consumed" in (result.output as Record<string, unknown>),
        false,
    );
});
