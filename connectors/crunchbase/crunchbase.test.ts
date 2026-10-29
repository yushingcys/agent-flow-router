import { assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";
import {
    loadFixture,
    runEndpoint,
    testBundle,
    testSealedUnit,
} from "@shared/testing";
import { directTransport, Engine } from "@agent-flow/connector-engine";

const fixtures = fromFileUrl(new URL("./fixtures/", import.meta.url));
const fixture = (name: string) => loadFixture(`${fixtures}${name}.json`);
const base = "https://api.crunchbase.com/v4/data";
const org = `${base}/entities/organizations/{entity_id}`;

Deno.test("crunchbase: Monid ids over the real v4 routes, one call each", async () => {
    const bundle = await testBundle();
    const docs = Object.values(bundle.endpoints).filter((d) =>
        d.provider === "crunchbase"
    );
    assertEquals(
        Object.fromEntries(
            docs.map((d) => [d.id, `${d.request.method} ${d.request.url}`]),
        ),
        {
            "crunchbase#search_organizations":
                `POST ${base}/searches/organizations`,
            "crunchbase#get_organization_profile": `GET ${org}`,
            "crunchbase#get_company_people": `GET ${org}/cards/jobs`,
            "crunchbase#get_company_funding_rounds":
                `GET ${org}/cards/raised_funding_rounds`,
            "crunchbase#search_investors": `POST ${base}/searches/principals`,
            "crunchbase#get_investor_profile":
                `GET ${base}/entities/principals/{entity_id}`,
        },
    );
    for (const doc of docs) assertEquals(doc.usage.model.kind, "PER_CALL");
});

Deno.test("crunchbase#search_investors: query narrowed to investors on the wire", async () => {
    let sent: { query: unknown[] } | undefined;
    const engine = new Engine({
        transport: directTransport({
            params: () => Promise.resolve({ apiKey: "test-key" }),
            fetch: (_url, init) => {
                sent = JSON.parse(String((init as { body?: unknown }).body));
                return Promise.resolve(
                    new Response(JSON.stringify({ count: 0, entities: [] }), {
                        status: 200,
                    }),
                );
            },
        }),
    });
    const loaded = await engine.load(
        await testSealedUnit("crunchbase#search_investors"),
    );
    const result = await loaded.run({
        body: {
            field_ids: ["identifier", "investor_type"],
            query: [{
                field_id: "location_identifiers",
                operator_id: "includes",
                values: ["san-francisco-california"],
            }],
        },
    });
    assertEquals(result.usage, {
        credits: { default: 1 },
        evidence: { CALL: 1 },
    });
    assertEquals(sent?.query.length, 2);
    assertEquals(sent?.query[1], {
        type: "predicate",
        field_id: "facet_ids",
        operator_id: "includes",
        values: ["investor"],
    });
});

Deno.test("crunchbase#search_organizations (synthetic): one call", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("crunchbase#search_organizations"),
        input: {
            body: {
                field_ids: ["identifier", "short_description"],
                query: [{
                    field_id: "identifier",
                    operator_id: "contains",
                    values: ["stripe"],
                }],
            },
        },
        mode: "replay",
        fixture: await fixture("synthetic-search"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage?.credits, { default: 1 });
});

Deno.test("crunchbase#get_company_funding_rounds (synthetic): one call", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("crunchbase#get_company_funding_rounds"),
        input: { pathParams: { entity_id: "stripe" } },
        mode: "replay",
        fixture: await fixture("synthetic-entity"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage?.credits, { default: 1 });
});

Deno.test("crunchbase 401 (synthetic): zero-billed, error list digested", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("crunchbase#get_organization_profile"),
        input: { pathParams: { entity_id: "stripe" } },
        mode: "replay",
        fixture: await fixture("synthetic-unauthorized"),
    });
    assertEquals(result.httpStatus, 401);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals(
        (result.output as { error_code?: string }).error_code,
        "LA401",
    );
});
