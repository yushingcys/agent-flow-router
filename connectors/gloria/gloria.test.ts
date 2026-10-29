import { assertEquals, assertRejects } from "@std/assert";
import type { Json } from "@shared/core";
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

/** Monid's five x402 paths (api.itsgloria.ai) and the REST route each
 *  one calls. */
const ROUTES: Record<string, string> = {
    "news": "/news",
    "news-by-keyword": "/news",
    "news-ticker-summary": "/news-ticker-summary",
    "pm-scorings": "/pm/scorings",
    "recaps": "/recaps",
};

Deno.test("gloria: Monid's 5 ids, one bearer auth, REST routes, per call", async () => {
    const bundle = await testBundle();
    const ids = Object.keys(bundle.endpoints).filter((id) =>
        id.startsWith("gloria#")
    ).sort();
    assertEquals(ids, Object.keys(ROUTES).map((p) => `gloria#${p}`).sort());
    const auth = bundle.endpoints["gloria#news"].auth.inject.$fn.key;
    for (const id of ids) {
        const doc = bundle.endpoints[id];
        assertEquals(doc.request.method, "GET", id);
        assertEquals(
            doc.request.url,
            "https://ai-hub.cryptobriefing.com" +
                ROUTES[id.slice("gloria#".length)],
            id,
        );
        assertEquals(doc.auth.inject.$fn.key, auth, id);
        assertEquals(doc.usage.model.kind, "PER_CALL", id);
    }
});

Deno.test("gloria#news and #news-by-keyword (synthetic): one chain, one call billed", async () => {
    const queryParams = { keyword: "bitcoin", limit: 2 };
    for (const id of ["gloria#news", "gloria#news-by-keyword"]) {
        const result = await runEndpoint({
            unit: await testSealedUnit(id),
            input: { queryParams },
            mode: "replay",
            fixture: await fixture("synthetic-news-ok"),
        });
        assertEquals(result.httpStatus, 200, id);
        assertEquals(result.usage, {
            credits: { default: 1 },
            evidence: { CALL: 1 },
        }, id);
        assertEquals((result.output as unknown[]).length, 2, id);
    }
});

Deno.test("gloria#news-by-keyword: keyword required, strict keys", async () => {
    const unit = await testSealedUnit("gloria#news-by-keyword");
    const synthetic = await fixture("synthetic-news-ok");
    for (
        const queryParams of [{}, { keyword: "" }, {
            keyword: "x",
            token: "t",
        }] as Record<string, Json>[]
    ) {
        await assertRejects(
            () =>
                runEndpoint({
                    unit,
                    input: { queryParams },
                    mode: "replay",
                    fixture: synthetic,
                }),
            Error,
            "INVALID_INPUT",
            JSON.stringify(queryParams),
        );
    }
});

Deno.test("gloria#recaps (synthetic): timeframe filled from the category", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("gloria#recaps"),
        input: { queryParams: { feed_category: "bitcoin" } },
        mode: "replay",
        fixture: await fixture("synthetic-recap-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals((result.output as { timeframe: string }).timeframe, "24h");
});

Deno.test("gloria#pm-scorings (synthetic): REST /pm/scorings", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("gloria#pm-scorings"),
        input: { queryParams: { limit: 1, tier: "TRADE" } },
        mode: "replay",
        fixture: await fixture("synthetic-pm-scorings-ok"),
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(
        (result.output as { scorings: unknown[] }).scorings.length,
        1,
    );
});

Deno.test("gloria#news-ticker-summary provider error (synthetic 401): data, zero usage", async () => {
    const result = await runEndpoint({
        unit: await testSealedUnit("gloria#news-ticker-summary"),
        input: { queryParams: { ticker: "SOL" } },
        mode: "replay",
        fixture: await fixture("synthetic-invalid-token"),
    });
    assertEquals(result.httpStatus, 401);
    assertEquals(result.isProviderError, true);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals(
        (result.output as { message: string }).message,
        "Invalid token",
    );
});

Deno.test({
    name: "gloria#news-ticker-summary live (gated on GLORIA_API_KEY)",
    ignore: liveSkip("gloria"),
    fn: async () => {
        const result = await runEndpoint({
            unit: await testSealedUnit("gloria#news-ticker-summary"),
            input: { queryParams: { ticker: "SOL" } },
            mode: "live",
        });
        assertEquals(
            result.isProviderError,
            false,
            JSON.stringify(result.output),
        );
        assertEquals(result.usage.credits, { default: 1 });
    },
});
