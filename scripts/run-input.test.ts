import { assertEquals, assertThrows } from "@std/assert";
import { runInputFromFlags } from "./run-input.ts";

Deno.test("RunInput flags: absent options stay absent", () => {
    assertEquals(runInputFromFlags({}), {});
    assertEquals(
        runInputFromFlags({
            body: undefined,
            queryParams: undefined,
            pathParams: undefined,
        }),
        {},
    );
    assertEquals(runInputFromFlags({ body: "null" }), { body: null });
    assertEquals(runInputFromFlags({ queryParams: "{}" }), { queryParams: {} });
    assertEquals(runInputFromFlags({ pathParams: "{}" }), { pathParams: {} });
});

Deno.test("RunInput flags: JSON passes through without stricter validation", () => {
    assertEquals(
        runInputFromFlags({
            body: '[null,false,0,""]',
            queryParams: '{"limit":2}',
            pathParams: '{"id":"abc"}',
        }),
        {
            body: [null, false, 0, ""],
            queryParams: { limit: 2 },
            pathParams: { id: "abc" },
        },
    );
    assertEquals<unknown>(
        runInputFromFlags({ queryParams: "null", pathParams: "[]" }),
        {
            queryParams: null,
            pathParams: [],
        },
    );
});

for (
    const [key, flag] of [
        ["body", "--body"],
        ["queryParams", "--query-params"],
        ["pathParams", "--path-params"],
    ]
) {
    Deno.test(`RunInput flags: malformed ${flag} retains its error`, () => {
        assertThrows(
            () => runInputFromFlags({ [key]: "{" }),
            Error,
            `${flag} is not valid JSON: SyntaxError:`,
        );
    });
}
