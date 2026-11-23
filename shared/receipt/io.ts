/**
 * JSON arguments for the verify-receipt CLI: a file path, `-` for stdin,
 * or (when `inline` is set) a JSON text.
 */

export async function readJsonInput(
    spec: string,
    label: string,
    opts: {
        /** Accept a `{...}` or `[...]` argument as JSON text. The receipt
         *  itself is a path or stdin, so the CLI leaves this off for it. */
        inline?: boolean;
        readText?: (path: string) => Promise<string>;
        readStdin?: () => Promise<string>;
    } = {},
): Promise<unknown> {
    const readText = opts.readText ?? ((path) => Deno.readTextFile(path));
    const readStdin = opts.readStdin ??
        (() => new Response(Deno.stdin.readable).text());
    if (spec === "-") {
        return parseJson(await readStdin(), label);
    }
    const trimmed = spec.trim();
    if (
        opts.inline &&
        (trimmed.startsWith("{") || trimmed.startsWith("["))
    ) {
        return parseJson(trimmed, label);
    }
    let text: string;
    try {
        text = await readText(spec);
    } catch (error) {
        throw new Error(
            `${label}: cannot read ${spec}: ${(error as Error).message}`,
        );
    }
    return parseJson(text, label);
}

function parseJson(text: string, label: string): unknown {
    try {
        return JSON.parse(text);
    } catch (error) {
        throw new Error(
            `${label} is not valid JSON: ${(error as Error).message}`,
        );
    }
}

/** Receipt, `--input`, and `--hosted-output` share one stdin. */
export function stdinConflict(specs: Array<string | undefined>): boolean {
    return specs.filter((spec) => spec === "-").length > 1;
}
