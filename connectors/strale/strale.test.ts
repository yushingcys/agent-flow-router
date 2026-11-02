import { assert, assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";
import {
    liveSkip,
    loadFixture,
    runEndpoint,
    testBundle,
    testSealedUnit,
} from "@shared/testing";

const fixtures = fromFileUrl(new URL("./fixtures/", import.meta.url));
const fixture = (name: string) => loadFixture(`${fixtures}${name}.json`);
type Body = Record<string, unknown> & { result: Record<string, unknown> };

Deno.test("strale: 188 Monid paths, capabilities via /v1/do with their slug fixed, solutions via execute", async () => {
    const bundle = await testBundle();
    const docs = Object.values(bundle.endpoints).filter((d) =>
        d.provider === "strale"
    );
    assertEquals(docs.length, 188);
    const solutions = docs.filter((d) => d.id.includes("/solutions/"));
    assertEquals(solutions.length, 4);
    for (const doc of docs) {
        const slug = doc.id.split("/").pop()!;
        const src = bundle.fnTable[doc.input.toRequest!.$fn.key].src;
        if (doc.id.includes("/solutions/")) {
            assertEquals(
                doc.request.url,
                `https://api.strale.io/v1/solutions/${slug}/execute`,
            );
        } else {
            assertEquals(doc.request.url, "https://api.strale.io/v1/do");
            assert(src.includes(JSON.stringify(slug)), doc.id);
        }
        assertEquals(doc.request.method, "POST", doc.id);
        assert(src.includes("max_price_cents"), doc.id);
        const model = doc.usage.model;
        if (model.kind === "FREE") {
            assertEquals(Object.keys(doc.usage.credits), [], doc.id);
        } else {
            assertEquals(model.kind, "PER_UNIT", doc.id);
        }
    }
    // x402 v1 and v2 twins run the same capability at the same price
    const v1 = bundle.endpoints["strale#x402/whois-lookup"];
    const v2 = bundle.endpoints["strale#x402/v2/whois-lookup"];
    assertEquals(v1.input.toRequest, v2.input.toRequest);
    assertEquals(v1.usage.model, v2.usage.model);
});

Deno.test("strale#x402/v2/whois-lookup (synthetic sync): the reported charge settles in euros, our balance stripped", async () => {
    const unit = await testSealedUnit("strale#x402/v2/whois-lookup");
    const result = await runEndpoint({
        unit,
        input: { body: { domain: "example.com" } },
        mode: "replay",
        fixture: await fixture("synthetic-do-sync"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, {
        credits: { default: 0.05 },
        evidence: { RESULT: 1 },
    });
    const body = result.output as Body;
    assertEquals(body.result.price_cents, 5);
    assertEquals("wallet_balance_cents" in body.result, false);
    assertEquals(
        (body.result.output as { domain: string }).domain,
        "example.com",
    );
});

Deno.test("strale#x402/page-speed-test (synthetic async): 202, poll pending, completed transaction billed", async () => {
    const unit = await testSealedUnit("strale#x402/page-speed-test");
    const result = await runEndpoint({
        unit,
        input: { body: { url: "https://example.com" } },
        mode: "replay",
        fixture: await fixture("synthetic-do-async"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, {
        credits: { default: 0.05 },
        evidence: { RESULT: 1 },
    });
    const body = result.output as Body;
    assertEquals(body.result.status, "completed");
    assertEquals(
        (body.result.output as { performance_score: number })
            .performance_score,
        92,
    );
});

Deno.test("strale (synthetic async failed): refunded upstream, a 502 at zero", async () => {
    const unit = await testSealedUnit("strale#x402/page-speed-test");
    const result = await runEndpoint({
        unit,
        input: { body: { url: "https://example.com" } },
        mode: "replay",
        fixture: await fixture("synthetic-do-async-failed"),
    });
    assertEquals(result.httpStatus, 502);
    assertEquals(result.isProviderError, true);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals(
        (result.output as { message: string }).message,
        "Upstream PageSpeed Insights timed out",
    );
});

Deno.test("strale#x402/iban-validate (free with a key): FREE, nothing claimed, balance stripped", async () => {
    const unit = await testSealedUnit("strale#x402/iban-validate");
    const result = await runEndpoint({
        unit,
        input: { body: { iban: "DE89370400440532013000" } },
        mode: "replay",
        fixture: await fixture("synthetic-do-free"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    const body = result.output as Body;
    assertEquals("wallet_balance_cents" in body.result, false);
    assertEquals((body.result.output as { valid: boolean }).valid, true);
});

Deno.test("strale#x402/solutions/website-health (synthetic): solution charge claimed, balance stripped from result and meta", async () => {
    const unit = await testSealedUnit("strale#x402/solutions/website-health");
    const result = await runEndpoint({
        unit,
        input: { body: { domain: "example.com" } },
        mode: "replay",
        fixture: await fixture("synthetic-solution"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, {
        credits: { default: 0.4 },
        evidence: { RESULT: 1 },
    });
    const body = result.output as Body & { meta: Record<string, unknown> };
    assertEquals("wallet_balance_cents" in body.result, false);
    assertEquals("wallet_balance_cents" in body.meta, false);
});

Deno.test("strale#x402/solutions/lead-email-verify (synthetic gated): an uncharged answer bills zero", async () => {
    const unit = await testSealedUnit(
        "strale#x402/solutions/lead-email-verify",
    );
    const result = await runEndpoint({
        unit,
        input: { body: { email: "not-an-email" } },
        mode: "replay",
        fixture: await fixture("synthetic-solution-gated"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, { credits: {}, evidence: { RESULT: 0 } });
});

Deno.test("strale (synthetic solution failed): status failed on a 200 is a 502 at zero", async () => {
    const unit = await testSealedUnit("strale#x402/solutions/website-health");
    const result = await runEndpoint({
        unit,
        input: { body: { domain: "example.com" } },
        mode: "replay",
        fixture: await fixture("synthetic-solution-failed"),
    });
    assertEquals(result.httpStatus, 502);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    const out = result.output as { message: string; raw: Body };
    assertEquals(out.message, "ssl-certificate-chain: connection refused");
    assertEquals("wallet_balance_cents" in out.raw.result, false);
});

Deno.test("strale (synthetic 402): error envelope digested, our balance dropped", async () => {
    const unit = await testSealedUnit("strale#x402/v2/whois-lookup");
    const result = await runEndpoint({
        unit,
        input: { body: { domain: "example.com" } },
        mode: "replay",
        fixture: await fixture("synthetic-insufficient-balance"),
    });
    assertEquals(result.httpStatus, 402);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    const out = result.output as {
        error_code: string;
        raw: { details: Record<string, unknown> };
    };
    assertEquals(out.error_code, "insufficient_balance");
    assertEquals("wallet_balance_cents" in out.raw.details, false);
});

Deno.test({
    name: "strale#x402/v2/iban-validate live (gated on STRALE_API_KEY)",
    ignore: liveSkip("strale"),
    fn: async () => {
        const unit = await testSealedUnit("strale#x402/v2/iban-validate");
        const result = await runEndpoint({
            unit,
            input: { body: { iban: "DE89370400440532013000" } },
            mode: "live",
        });
        assertEquals(
            result.isProviderError,
            false,
            JSON.stringify(result.output),
        );
        assertEquals(result.usage.credits, {});
    },
});
