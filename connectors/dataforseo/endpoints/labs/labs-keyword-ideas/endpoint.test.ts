import { assertEquals } from "@std/assert";
import type { Json } from "@shared/core";
import { testSealedUnit } from "@shared/testing";
import { directTransport, Engine } from "@agent-flow/connector-engine";

Deno.test("dataforseo keyword-ideas: clickstream settle evidence agrees with the receipt", async (t) => {
    const unit = await testSealedUnit("dataforseo#labs/keyword-ideas");
    for (const clickstream of [true, false]) {
        for (const shape of ["items", "items_count", "empty", "error"]) {
            await t.step(`clickstream=${clickstream}, ${shape}`, async () => {
                const rows = shape === "empty" ? 0 : 1;
                const count = clickstream ? 2 * rows + 100 : rows;
                const cost = clickstream
                    ? (rows === 0 ? 0.024 : 0.02424)
                    : (rows === 0 ? 0.012 : 0.01212);
                const result: Json = shape === "items"
                    ? { items: [{ keyword: "seo" }], items_count: 99 }
                    : shape === "items_count"
                    ? { items_count: 1 }
                    : {};
                const engine = new Engine({
                    transport: directTransport({
                        params: () =>
                            Promise.resolve({
                                login: "test",
                                password: "test",
                            }),
                        fetch: () =>
                            Promise.resolve(
                                new Response(
                                    JSON.stringify({
                                        status_code: 20000,
                                        cost,
                                        tasks: [{
                                            status_code: shape === "error"
                                                ? 40501
                                                : 20000,
                                            result: [result],
                                        }],
                                    }),
                                    {
                                        headers: {
                                            "content-type": "application/json",
                                        },
                                    },
                                ),
                            ),
                    }),
                });
                const loaded = await engine.load(unit);
                const input = {
                    body: {
                        keywords: ["seo"],
                        limit: 1,
                        include_clickstream_data: clickstream,
                    },
                };
                const estimate = await loaded.estimate(input);
                assertEquals(estimate.evidence, {
                    base_fee: 1,
                    rows: clickstream ? 102 : 1,
                });
                const run = await loaded.run(input);
                assertEquals(
                    run.usage,
                    shape === "error" ? { credits: {}, evidence: {} } : {
                        credits: { default: cost },
                        evidence: { base_fee: 1, rows: count },
                    },
                );
            });
        }
    }
});
