import { assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";
import {
    loadFixture,
    runEndpoint,
    testBundle,
    testSealedUnit,
} from "@shared/testing";

const fixtures = fromFileUrl(new URL("./fixtures/", import.meta.url));
const fixture = (name: string) => loadFixture(`${fixtures}${name}.json`);

const PRODUCTS: Record<string, string> = {
    "datalegion#company/enrich/base": "company_base",
    "datalegion#company/enrich/premium": "company_premium",
    "datalegion#person/enrich/base/no-pii": "person_base",
    "datalegion#person/enrich/base/pii": "person_base_contact",
    "datalegion#person/enrich/premium/no-pii": "person_premium",
    "datalegion#person/enrich/premium/pii": "person_premium_contact",
};

Deno.test("datalegion: six Monid product ids over two wire paths, one pool each", async () => {
    const bundle = await testBundle();
    const docs = Object.values(bundle.endpoints).filter((d) =>
        d.provider === "datalegion"
    );
    assertEquals(docs.map((d) => d.id).sort(), Object.keys(PRODUCTS).sort());
    for (const doc of docs) {
        const kind = doc.id.split("#")[1].split("/")[0];
        assertEquals(doc.request.method, "POST", doc.id);
        assertEquals(
            doc.request.url,
            `https://api.datalegion.ai/${kind}/enrich`,
            doc.id,
        );
        assertEquals(Object.keys(doc.usage.credits), [PRODUCTS[doc.id]]);
    }
});

for (const [id, pool] of Object.entries(PRODUCTS)) {
    const person = id.includes("#person/");
    Deno.test(`${id} (synthetic): one record = one ${pool} credit`, async () => {
        const result = await runEndpoint({
            unit: await testSealedUnit(id),
            input: {
                body: person
                    ? { email: "jane.doe@example.com" }
                    : { domain: "stripe.com" },
            },
            mode: "replay",
            fixture: await fixture(
                person ? "synthetic-person-match" : "synthetic-company-match",
            ),
        });
        assertEquals(result.httpStatus, 200);
        assertEquals(result.usage, {
            credits: { [pool]: 1 },
            evidence: { RESULT: 1 },
        });
    });
}

Deno.test("datalegion 404 no-match (synthetic): free, error digested", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("datalegion#person/enrich/base/pii"),
        input: { body: { email: "nobody@example.com" } },
        mode: "replay",
        fixture: await fixture("synthetic-no-match"),
    });
    assertEquals(result.httpStatus, 404);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals(
        (result.output as { error_code?: string }).error_code,
        "not_found",
    );
});
