import { assertEquals, assertStringIncludes } from "@std/assert";

for (
    const [task, args] of [
        ["engine:run", ["missing#endpoint"]],
        ["engine:estimate", ["missing#endpoint"]],
        ["record", ["missing#endpoint", "unused"]],
    ] as const
) {
    Deno.test(`RunInput CLI: ${task} passes absent options without fields`, async () => {
        const script = task === "record" ? "record" : task.split(":")[1];
        // Observe the engine boundary, before execution or fixture recording.
        const code = `
            import { Engine } from "@agent-flow/connector-engine";
            const capture = (input) => {
                console.log(JSON.stringify(Object.keys(input)));
                Deno.exit(0);
            };
            Engine.prototype.load = async () => ({ run: capture, estimate: capture });
            Deno.args.splice(0, Deno.args.length, "exa#search", ...${
            JSON.stringify(task === "record" ? ["unused"] : [])
        });
            await import("./scripts/${script}.ts");
        `;
        const result = await new Deno.Command("deno", {
            args: ["eval", "--unstable-kv", code],
            cwd: new URL("../", import.meta.url),
            stdout: "piped",
            stderr: "piped",
        }).output();
        assertEquals(result.code, 0, new TextDecoder().decode(result.stderr));
        assertEquals(new TextDecoder().decode(result.stdout).trim(), "[]");
    });
    for (const flag of ["--body", "--query-params", "--path-params"]) {
        Deno.test({
            name:
                `RunInput CLI: ${task} rejects malformed ${flag} before catalog work`,
            async fn() {
                const result = await new Deno.Command("deno", {
                    args: ["task", task, ...args, flag, "{"],
                    cwd: new URL("../", import.meta.url),
                    stdout: "piped",
                    stderr: "piped",
                }).output();
                assertEquals(result.code, 1);
                assertEquals(new TextDecoder().decode(result.stdout), "");
                const stderr = new TextDecoder().decode(result.stderr);
                assertStringIncludes(
                    stderr,
                    `${flag} is not valid JSON: SyntaxError:`,
                );
                assertEquals(stderr.includes("[engine:run]"), false);
                assertEquals(stderr.includes("PermissionDenied"), false);
            },
        });
    }
}
