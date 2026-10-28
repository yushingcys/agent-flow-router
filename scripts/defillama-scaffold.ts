/**
 * deno task defillama:scaffold
 *
 * AUTHORING-TIME generator for `connectors/defillama/endpoints/*`: one
 * endpoint per DefiLlama path that Monid sells (monid.ai/tools/defillama),
 * with input schemas mirrored from DefiLlama's OpenAPI spec.
 *
 *   - the endpoint SET and the free/paid split come from Monid's public
 *     listing, so ids match Monid's paths and `monid:prices` prices them;
 *   - parameters, summaries and descriptions come from the spec that
 *     api-docs.defillama.com ships as a JS module of object literals. It is
 *     PARSED with the TypeScript AST, never executed.
 *
 * Monid's `/free/<path>` is the keyless public API's `<path>`; every other
 * Monid path is a Pro path. Endpoint ids are lowercase (zEndpointPath), so
 * a camelCase vendor path (`/api/chainAssets`) keeps its case in
 * `request.path` and declares the lowercased `endpoint`; monid-prices maps
 * it back. Re-run to refresh; review the git diff.
 */
import ts from "typescript";
import { emptyDir } from "@std/fs";
import { fromFileUrl, join } from "@std/path";

const DOCS = "https://api-docs.defillama.com";
const MONID = "https://api.monid.ai/public/v1/endpoints?category=defillama";
const OUT = fromFileUrl(
    new URL("../connectors/defillama/endpoints/", import.meta.url),
);

type Param = {
    name: string;
    in: "path" | "query";
    required?: boolean;
    description?: string;
    schema: {
        type: "string" | "integer" | "number" | "boolean";
        enum?: string[];
        example?: unknown;
        default?: unknown;
        minimum?: number;
        maximum?: number;
        format?: string;
    };
};
type Operation = {
    summary: string;
    description?: string;
    tags?: string[];
    parameters?: Param[];
    servers?: { url: string }[];
};
type Spec = {
    servers: { url: string }[];
    paths: Record<string, { get: Operation }>;
};

/** Evaluate a module's exported object literals without running it. */
function literalExports(source: string): Record<string, unknown> {
    const file = ts.createSourceFile("spec.js", source, ts.ScriptTarget.Latest);
    const vars = new Map<string, ts.Expression>();
    const exported = new Map<string, string>();
    for (const node of file.statements) {
        if (ts.isVariableStatement(node)) {
            for (const d of node.declarationList.declarations) {
                if (ts.isIdentifier(d.name) && d.initializer) {
                    vars.set(d.name.text, d.initializer);
                }
            }
        } else if (
            ts.isExportDeclaration(node) && node.exportClause &&
            ts.isNamedExports(node.exportClause)
        ) {
            for (const e of node.exportClause.elements) {
                exported.set(e.name.text, (e.propertyName ?? e.name).text);
            }
        }
    }
    const value = (e: ts.Expression): unknown => {
        if (ts.isParenthesizedExpression(e)) return value(e.expression);
        if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) {
            return e.text;
        }
        if (ts.isNumericLiteral(e)) return Number(e.text);
        if (e.kind === ts.SyntaxKind.TrueKeyword) return true;
        if (e.kind === ts.SyntaxKind.FalseKeyword) return false;
        if (e.kind === ts.SyntaxKind.NullKeyword) return null;
        if (ts.isPrefixUnaryExpression(e)) {
            const v = value(e.operand);
            if (e.operator === ts.SyntaxKind.ExclamationToken) return !v;
            if (e.operator === ts.SyntaxKind.MinusToken) return -Number(v);
        }
        if (ts.isIdentifier(e) && vars.has(e.text)) {
            return value(vars.get(e.text)!);
        }
        if (ts.isArrayLiteralExpression(e)) return e.elements.map(value);
        if (ts.isObjectLiteralExpression(e)) {
            const out: Record<string, unknown> = {};
            for (const p of e.properties) {
                if (ts.isShorthandPropertyAssignment(p)) {
                    out[p.name.text] = value(p.name);
                } else if (
                    ts.isPropertyAssignment(p) &&
                    (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name) ||
                        ts.isNumericLiteral(p.name))
                ) {
                    out[p.name.text] = value(p.initializer);
                } else {
                    throw new Error(`unsupported property at ${p.pos}`);
                }
            }
            return out;
        }
        throw new Error(
            `unsupported ${ts.SyntaxKind[e.kind]} at ${e.pos} in the spec`,
        );
    };
    return Object.fromEntries(
        [...exported].map(([name, local]) => [name, value(vars.get(local)!)]),
    );
}

async function text(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    return await res.text();
}

async function loadSpecs() {
    const html = await text(DOCS + "/");
    const asset = html.match(/\/assets\/api-specifications-[\w-]+\.js/)?.[0];
    if (!asset) throw new Error("spec asset not found on " + DOCS);
    const all = Object.values(literalExports(await text(DOCS + asset)));
    const specs = all.filter((s): s is Spec =>
        typeof s === "object" && s !== null && "paths" in s
    );
    const free = specs.find((s) => s.servers[0].url === "https://api.llama.fi");
    const pro = specs.find((s) => s.servers[0].url.includes("pro-api"));
    if (!free || !pro) throw new Error("free/pro specs not recognized");
    return { free, pro };
}

async function loadMonid() {
    const items: { endpoint: string }[] = [];
    let cursor: string | undefined;
    do {
        const res = await fetch(
            MONID + "&limit=100" +
                (cursor ? "&cursor=" + encodeURIComponent(cursor) : ""),
        );
        if (!res.ok) throw new Error(`monid listing: ${res.status}`);
        const page = await res.json();
        items.push(...page.items);
        cursor = page.items.length ? page.cursor : undefined;
    } while (cursor);
    return new Set(items.map((i) => i.endpoint));
}

const CATEGORY_BY_TAG: Record<string, string[]> = {
    coins: ["token-prices"],
    narratives: ["token-prices"],
    yields: ["yields"],
    perps: ["derivatives"],
    Equities: ["equities"],
    ETFs: ["equities"],
    "Pre-IPO": ["equities", "funding-data"],
};
const categoriesOf = (path: string, op: Operation) =>
    path === "/api/raises"
        ? ["defi", "funding-data"]
        : CATEGORY_BY_TAG[op.tags?.[0] ?? ""] ?? ["defi"];

const q = (s: string) => JSON.stringify(s.replace(/\s+/g, " ").trim());
const key = (name: string) =>
    /^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name);

function zodOf(p: Param): string {
    const s = p.schema;
    let z: string;
    if (p.in === "path") {
        z = s.type === "integer"
            ? "z.string().regex(/^\\d+$/)"
            : s.type === "number"
            ? "z.string().regex(/^\\d+(\\.\\d+)?$/)"
            : "z.string().min(1)";
    } else if (s.enum) {
        z = `z.enum(${JSON.stringify(s.enum)})`;
    } else if (s.type === "integer" || s.type === "number") {
        z = s.type === "integer" ? "z.number().int()" : "z.number()";
        if (s.minimum !== undefined) z += `.min(${s.minimum})`;
        if (s.maximum !== undefined) z += `.max(${s.maximum})`;
    } else if (s.type === "boolean") {
        z = "z.boolean()";
    } else {
        z = s.format === "date"
            ? "z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/)"
            : "z.string()";
    }
    const notes = [
        p.description?.trim().replace(/\.?$/, "."),
        s.default !== undefined ? `Default \`${s.default}\`.` : undefined,
        s.example !== undefined ? `Example: \`${s.example}\`.` : undefined,
    ].filter(Boolean).join(" ");
    if (notes) z += `.describe(${q(notes)})`;
    return p.in === "query" && !p.required ? z + ".optional()" : z;
}

function inputsFile(method: string, params: Param[]) {
    const block = (where: "path" | "query", name: string, doc: string) => {
        const ps = params.filter((p) => p.in === where);
        if (!ps.length) return "";
        return `\n/** ${method} ${doc} parameters. */\n` +
            `export const ${name} = z.object({\n` +
            ps.map((p) => `    ${key(p.name)}: ${zodOf(p)},\n`).join("") +
            "});\n";
    };
    return `// Generated by scripts/defillama-scaffold.ts - do not edit by hand.\n` +
        `import { z } from "zod";\n` +
        block("path", "zPathParams", "path") +
        block("query", "zQueryParams", "query");
}

function endpointFile(o: {
    path: string;
    op: Operation;
    free?: { baseUrl: string; vendorPath: string };
}) {
    const { path, op, free } = o;
    const params = op.parameters ?? [];
    const schemas = [
        params.some((p) => p.in === "path") ? "pathParams: zPathParams" : "",
        params.some((p) => p.in === "query") ? "queryParams: zQueryParams" : "",
    ].filter(Boolean);
    const imports = schemas.map((s) => s.split(": ")[1]);
    const summary = op.summary.trim().replace(/\.$/, "");
    const description = [
        op.description && op.description.trim() !== op.summary.trim()
            ? op.description
            : summary + ".",
        free
            ? "Free: served by DefiLlama's keyless public API, no charge."
            : "",
    ].filter(Boolean).join(" ");
    const lines = [
        `// Generated by scripts/defillama-scaffold.ts - do not edit by hand.`,
        `import { defineEndpoint } from "@shared/core";`,
        ...(free ? [`import { freeApi } from "../../schema/free.ts";`] : []),
        ...(imports.length
            ? [`import { ${imports.join(", ")} } from "./schema/inputs.ts";`]
            : []),
        ``,
        `/** GET ${free ? free.baseUrl + free.vendorPath : path} */`,
        `export default defineEndpoint({`,
        `    meta: {`,
        `        displayName: ${q(summary)},`,
        `        summary: ${q(summary)},`,
        `        description: ${q(description)},`,
        `        categories: ${JSON.stringify(categoriesOf(path, op))},`,
        `    },`,
        ...(free
            ? [
                `    endpoint: ${q(path.toLowerCase())},`,
                `    request: {`,
                `        method: "GET",`,
                `        baseUrl: ${q(free.baseUrl)},`,
                `        path: ${q(free.vendorPath)},`,
                `    },`,
                `    ...freeApi,`,
            ]
            : [
                ...(path !== path.toLowerCase()
                    ? [`    endpoint: ${q(path.toLowerCase())},`]
                    : []),
                `    request: { method: "GET", path: ${q(path)} },`,
            ]),
        ...(schemas.length
            ? [`    input: { schema: { ${schemas.join(", ")} } },`]
            : []),
        `});`,
        ``,
    ];
    return lines.join("\n");
}

const folderOf = (path: string) =>
    path.slice(1).replace(/[{}]/g, "").replace(/\//g, "-").toLowerCase();

const [{ free, pro }, monid] = await Promise.all([loadSpecs(), loadMonid()]);
await emptyDir(OUT);
const missing: string[] = [];
for (const path of [...monid].sort()) {
    const isFree = path.startsWith("/free/");
    const vendorPath = isFree ? path.slice("/free".length) : path;
    const op = (isFree ? free : pro).paths[vendorPath]?.get;
    if (!op) {
        missing.push(path);
        continue;
    }
    const dir = join(OUT, folderOf(path));
    await Deno.mkdir(join(dir, "schema"), { recursive: true });
    await Deno.writeTextFile(
        join(dir, "endpoint.ts"),
        endpointFile({
            path,
            op,
            ...(isFree
                ? {
                    free: {
                        baseUrl: (op.servers ?? free.servers)[0].url,
                        vendorPath,
                    },
                }
                : {}),
        }),
    );
    if (op.parameters?.length) {
        await Deno.writeTextFile(
            join(dir, "schema", "inputs.ts"),
            inputsFile("GET " + vendorPath, op.parameters),
        );
    } else {
        await Deno.remove(join(dir, "schema"));
    }
}
console.log(`${monid.size - missing.length} endpoints written to ${OUT}`);
if (missing.length) console.log("not in DefiLlama's spec (skipped):", missing);
