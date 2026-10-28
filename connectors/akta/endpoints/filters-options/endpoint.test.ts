import { assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";
import { loadFixture, runEndpoint, testSealedUnit } from "@shared/testing";

const fixturesDir = fromFileUrl(new URL("./fixtures/", import.meta.url));

Deno.test("akta#filters-options happy (synthetic): free, JSON body", async () => {
    const unit = await testSealedUnit("akta#v1/filters/options");
    const fixture = await loadFixture(`${fixturesDir}synthetic-happy.json`);
    const result = await runEndpoint({
        unit,
        input: {
            body: {
                dropdowns: [{ dropdown_type: "firmographic.company_type" }],
            },
        },
        mode: "replay",
        fixture,
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    // billing field absorbed out of the payload
    assertEquals(
        "credits_consumed" in (result.output as Record<string, unknown>),
        false,
    );
});
