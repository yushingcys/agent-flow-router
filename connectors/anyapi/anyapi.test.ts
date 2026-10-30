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
const fixture = (name: string) =>
    loadFixture(`${fixtures}synthetic-${name}.json`);

Deno.test("anyapi: 237 generated SKUs share one auth, consolidate and error digest", async () => {
    const bundle = await testBundle();
    const docs = Object.values(bundle.endpoints).filter((d) =>
        d.provider === "anyapi"
    );
    assertEquals(docs.length, 237);
    const [first] = docs;
    for (const doc of docs) {
        const sku = doc.id.slice("anyapi#".length);
        assertEquals(doc.request.method, "POST", doc.id);
        assertEquals(
            doc.request.url,
            `https://api.getanyapi.com/v1/run/${sku}`,
        );
        assertEquals(doc.auth.inject.$fn.key, first.auth.inject.$fn.key);
        assertEquals(
            doc.usage.consolidate?.$fn.key,
            first.usage.consolidate?.$fn.key,
        );
        assertEquals(
            doc.output.fromError?.$fn.key,
            first.output.fromError?.$fn.key,
        );
        assertEquals(doc.usage.credits, { default: { label: "US dollars" } });
    }
});

Deno.test("anyapi#instagram.hashtag_recent_posts (synthetic): costUsd claimed and stripped", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("anyapi#instagram.hashtag_recent_posts"),
        input: { body: { hashtag: "skincare" } },
        mode: "replay",
        fixture: await fixture("flat-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.usage, {
        credits: { default: 0.0012 },
        evidence: { CALL: 1 },
    });
    const output = result.output as Record<string, unknown>;
    assertEquals(Object.keys(output).sort(), ["items", "output"]);
});

Deno.test("anyapi (synthetic): a failover to a dearer lane settles at costUsd", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("anyapi#instagram.hashtag_recent_posts"),
        input: { body: { hashtag: "skincare" } },
        mode: "replay",
        fixture: await fixture("failover-ok"),
    });
    assertEquals(result.usage.credits, { default: 0.0024 });
    assertEquals(result.usage.mismatch, { derived: { default: 0.0012 } });
});

Deno.test("anyapi#capterra.reviews (synthetic): base + per result, claim agrees with the fold", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("anyapi#capterra.reviews"),
        input: {
            body: { product: "https://www.capterra.com/p/135003/Slack/" },
        },
        mode: "replay",
        fixture: await fixture("linear-ok"),
    });
    assertEquals(result.usage.credits, { default: 0.00814 });
    assertEquals(result.usage.evidence, { call: 1, results: 3 });
    assertEquals(result.usage.mismatch, undefined);
});

Deno.test("anyapi (synthetic): a 401 digests `error`, bills nothing", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("anyapi#web.scrape"),
        input: { body: { url: "https://example.com" } },
        mode: "replay",
        fixture: await fixture("unauthorized"),
    });
    assertEquals(result.httpStatus, 401);
    assertEquals(result.isProviderError, true);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals(result.output, {
        message: "missing credential",
        code: "unauthorized",
        raw: { error: "missing credential", code: "unauthorized" },
    });
});

Deno.test("anyapi (synthetic): a free miss reports costUsd 0 and keeps found false", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("anyapi#instagram.profile"),
        input: { body: { handle: "no_such_user_x" } },
        mode: "replay",
        fixture: await fixture("not-found"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(
        (result.output as { output: { found: boolean } }).output.found,
        false,
    );
});

Deno.test({
    name: "anyapi#google.search live",
    ignore: liveSkip("anyapi"),
    fn: async () => {
        const result = await runEndpoint({
            unit: await testSealedUnit("anyapi#google.search"),
            input: { body: { query: "agent flow router" } },
            mode: "live",
        });
        assertEquals(result.httpStatus, 200);
        assert((result.usage.credits.default ?? 0) > 0);
    },
});
