import { assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";
import {
    estimateEndpoint,
    loadFixture,
    runEndpoint,
    testBundle,
    testSealedUnit,
} from "@shared/testing";

const fixtures = fromFileUrl(new URL("./fixtures/", import.meta.url));
const fixture = (name: string) => loadFixture(`${fixtures}${name}.json`);
const P = "the-companies-api#";

Deno.test("the-companies-api: Monid ids over the real v2 routes", async () => {
    const bundle = await testBundle();
    const urls = Object.fromEntries(
        Object.values(bundle.endpoints)
            .filter((d) => d.provider === "the-companies-api")
            .map((d) => [d.id, `${d.request.method} ${d.request.url}`]),
    );
    const base = "https://api.thecompaniesapi.com/v2";
    assertEquals(urls, {
        [`${P}search_industries`]: `GET ${base}/industries`,
        [`${P}count_companies`]: `POST ${base}/companies/count`,
        [`${P}enrich_company_from_domain`]: `GET ${base}/companies/{domain}`,
        [`${P}find_company_email_patterns`]:
            `GET ${base}/companies/{domain}/email-patterns`,
        [`${P}search_companies`]: `POST ${base}/companies`,
        [`${P}fetch_company_context`]: `GET ${base}/companies/{domain}/context`,
    });
});

Deno.test("enrich_company_from_domain (synthetic): meta.cost claimed, balance stripped", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit(`${P}enrich_company_from_domain`),
        input: { pathParams: { domain: "microsoft.com" } },
        mode: "replay",
        fixture: await fixture("synthetic-company"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, {
        credits: { default: 1 },
        evidence: { CREDIT: 1 },
    });
    const meta = (result.output as { meta: Record<string, unknown> }).meta;
    assertEquals("cost" in meta, false);
    assertEquals("credits" in meta, false);
    assertEquals(meta.score, 98);
});

Deno.test("enrich_company_from_domain estimate: refresh adds 10 credits, simplified is free", async () => {
    const unit = await testSealedUnit(`${P}enrich_company_from_domain`);
    const pathParams = { domain: "microsoft.com" };
    const est = (queryParams: Record<string, boolean>) =>
        estimateEndpoint(unit, { pathParams, queryParams });
    assertEquals((await est({})).credits, { default: 1 });
    assertEquals((await est({ refresh: true })).credits, { default: 11 });
    assertEquals((await est({ simplified: true })).credits, {});
});

Deno.test("search_companies estimate: size defaults to 10", async () => {
    const usage = await estimateEndpoint(
        await testSealedUnit(`${P}search_companies`),
        { body: { search: "shop" } },
    );
    assertEquals(usage.evidence, { RESULT: 10 });
});

Deno.test("search_companies (synthetic): one credit per company, size defaults to 10", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit(`${P}search_companies`),
        input: {
            body: {
                query: [{
                    attribute: "about.industries",
                    operator: "or",
                    sign: "equals",
                    values: ["retail"],
                }],
            },
        },
        mode: "replay",
        fixture: await fixture("synthetic-search"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, {
        credits: { default: 2 },
        evidence: { RESULT: 2 },
    });
    const meta = (result.output as { meta: Record<string, unknown> }).meta;
    assertEquals(meta.total, 2);
    assertEquals("credits" in meta, false);
});

Deno.test("find_company_email_patterns (synthetic): bare array, one credit", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit(`${P}find_company_email_patterns`),
        input: { pathParams: { domain: "apple.com" } },
        mode: "replay",
        fixture: await fixture("synthetic-email-patterns"),
    });
    assertEquals(result.usage, {
        credits: { default: 1 },
        evidence: { CALL: 1 },
    });
    assertEquals((result.output as unknown[]).length, 2);
});

Deno.test("search_industries and count_companies (synthetic): free", async () => {
    const industries = await runEndpoint({
        unit: await testSealedUnit(`${P}search_industries`),
        input: { queryParams: { search: "saas" } },
        mode: "replay",
        fixture: await fixture("synthetic-industries"),
    });
    assertEquals(industries.usage, { credits: {}, evidence: {} });
    const count = await runEndpoint({
        unit: await testSealedUnit(`${P}count_companies`),
        input: { body: { search: "shop" } },
        mode: "replay",
        fixture: await fixture("synthetic-count"),
    });
    assertEquals(count.output, { count: 48211 });
    assertEquals(count.usage, { credits: {}, evidence: {} });
});

Deno.test("fetch_company_context (synthetic): vendor meta.cost settles", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit(`${P}fetch_company_context`),
        input: { pathParams: { domain: "microsoft.com" } },
        mode: "replay",
        fixture: await fixture("synthetic-context"),
    });
    assertEquals(result.usage?.credits, { default: 1 });
});

Deno.test("404 (synthetic): zero-billed, digested", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit(`${P}enrich_company_from_domain`),
        input: { pathParams: { domain: "nope.invalid" } },
        mode: "replay",
        fixture: await fixture("synthetic-not-found"),
    });
    assertEquals(result.httpStatus, 404);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals(
        (result.output as { message: string }).message,
        "companyNotFound",
    );
});
