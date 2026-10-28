/**
 * deno task tikhub:scaffold
 *
 * AUTHORING-TIME generator for connectors/tikhub/endpoints/**: one endpoint
 * folder per TikHub endpoint that Monid sells (its public listing), with
 * inputs mirrored from TikHub's OpenAPI spec and the per-call price taken
 * from Monid. The output is committed and reviewed like apify:scaffold's;
 * the build stays a pure function of repo content. Refresh = re-run.
 *
 * Paths Monid lists that our endpoint ids cannot spell (uppercase segments)
 * or that the spec lacks are skipped and printed.
 */
import { join } from "@std/path";
import { REPO_ROOT } from "./lib.ts";

const SPEC_URL = "https://api.tikhub.io/openapi.json";
const MONID_URL = "https://api.monid.ai/public/v1/endpoints?provider=tikhub";
const OUT = join(REPO_ROOT, "connectors", "tikhub", "endpoints");
const ID_PATH = /^\/[a-z0-9][a-z0-9._~-]*(?:\/[a-z0-9][a-z0-9._~-]*)*$/;
const MAX_DEPTH = 4;

interface Node {
    $ref?: string;
    type?: string;
    anyOf?: Node[];
    allOf?: Node[];
    enum?: unknown[];
    items?: Node;
    properties?: Record<string, Node>;
    required?: string[];
    description?: string;
    title?: string;
}
interface Param {
    name: string;
    in: string;
    required?: boolean;
    description?: string;
    schema: Node;
}
interface Op {
    tags?: string[];
    summary?: string;
    description?: string;
    operationId: string;
    parameters?: Param[];
    requestBody?: { content: Record<string, { schema: Node }> };
}
interface MonidItem {
    endpoint: string;
    displayDescription: string;
    price: { type: string; amount: { value: number } };
    categories: string[];
}

const spec = await (await fetch(SPEC_URL)).json() as {
    paths: Record<string, Record<string, Op>>;
    components: { schemas: Record<string, Node> };
};
const listing: MonidItem[] = [];
let cursor: string | undefined;
do {
    const url = `${MONID_URL}&limit=100` +
        (cursor ? `&cursor=${encodeURIComponent(cursor)}` : "");
    const page = await (await fetch(url)).json();
    listing.push(...page.items);
    cursor = page.items.length ? page.cursor : undefined;
} while (cursor);

const q = (s: string) => JSON.stringify(s);
const key = (k: string) => /^[A-Za-z_$][\w$]*$/.test(k) ? k : q(k);

function describe(text: string | undefined): string {
    const clean = (text ?? "").replace(/\s+/g, " ").trim();
    if (!clean) return "";
    return `.describe(${
        q(clean.length > 300 ? clean.slice(0, 297) + "..." : clean)
    })`;
}

function resolve(node: Node): Node {
    return node.$ref
        ? spec.components.schemas[node.$ref.split("/").pop()!]
        : node;
}

function zod(raw: Node, depth: number): string {
    const node = resolve(raw);
    if (depth > MAX_DEPTH) return "z.any()";
    if (node.anyOf || node.allOf) {
        const all = node.anyOf ?? node.allOf!;
        const parts = all.filter((n) => n.type !== "null");
        const nullable = parts.length < all.length ? ".nullable()" : "";
        const inner = parts.length === 1
            ? zod(parts[0], depth)
            : `z.union([${parts.map((p) => zod(p, depth)).join(", ")}])`;
        return inner + nullable;
    }
    if (node.enum?.length) {
        return node.enum.every((v) => typeof v === "string")
            ? `z.enum([${node.enum.map((v) => q(v as string)).join(", ")}])`
            : `z.literal([${
                node.enum.map((v) => JSON.stringify(v)).join(", ")
            }])`;
    }
    switch (node.type) {
        case "string":
            return "z.string()";
        case "integer":
            return "z.number().int()";
        case "number":
            return "z.number()";
        case "boolean":
            return "z.boolean()";
        case "array":
            return `z.array(${zod(node.items ?? {}, depth + 1)})`;
        case "object":
            return node.properties
                ? object(node, depth + 1)
                : "z.record(z.string(), z.any())";
        default:
            return "z.any()";
    }
}

function object(node: Node, depth: number): string {
    const required = new Set(node.required ?? []);
    const fields = Object.entries(node.properties ?? {}).map(([k, v]) => {
        const field = zod(v, depth) +
            describe(resolve(v).description ?? v.description);
        return `${key(k)}: ${field}${required.has(k) ? "" : ".optional()"},`;
    });
    return `z.object({${fields.join("\n")}})`;
}

function querySchema(params: Param[]): string {
    const fields = params.map((p) =>
        `${key(p.name)}: ${zod(p.schema, 1)}${
            describe(p.description ?? p.schema.description)
        }${p.required ? "" : ".optional()"},`
    );
    return `z.object({${fields.join("\n")}})`;
}

/** The English half of TikHub's bilingual description, without the price
 *  (ours is Monid's, stated by the usage model) or the example block. */
function englishDescription(op: Op): string | undefined {
    const text = op.description ?? "";
    const start = text.indexOf("# [English]");
    if (start < 0) return undefined;
    let body = text.slice(start + "# [English]".length);
    const example = body.indexOf("# [示例");
    if (example >= 0) body = body.slice(0, example);
    body = body.replace(/###\s*Price:?[\s\S]*?(?=###|$)/i, "").trim();
    if (!body) return undefined;
    return body.length > 1500 ? body.slice(0, 1497) + "..." : body;
}

const tagName = (op: Op) =>
    (op.tags?.[0] ?? "TikHub").replace(/-API$/, "").replace(/-/g, " ");

const skipped: string[] = [];
const mismatched: string[] = [];
await Deno.remove(OUT, { recursive: true }).catch(() => {});
let written = 0;
for (
    const item of listing.sort((a, b) => a.endpoint.localeCompare(b.endpoint))
) {
    const path = item.endpoint;
    const methods = spec.paths[path];
    if (!ID_PATH.test(path)) {
        skipped.push(`${path}: not a lowercase endpoint id`);
        continue;
    }
    if (!methods) {
        skipped.push(`${path}: not in TikHub's OpenAPI spec`);
        continue;
    }
    const [method, op] = Object.entries(methods)[0];
    const price = item.price.amount.value;
    if (item.price.type !== "PER_CALL") {
        skipped.push(`${path}: Monid price type ${item.price.type}`);
        continue;
    }
    const vendorPrice = /([\d.]+)\s*USD\s*\/\s*request/i.exec(
        op.description ?? "",
    );
    if (vendorPrice && Number(vendorPrice[1]) !== price) {
        mismatched.push(
            `${path}: Monid $${price}, TikHub doc $${vendorPrice[1]}`,
        );
    }

    const rest = path.slice("/api/v1/".length);
    const group = rest.split("/")[0].replace(/_/g, "-");
    const leaf = rest.replace(/[/_.]/g, "-");
    const dir = join(OUT, group, leaf);
    await Deno.mkdir(join(dir, "schema"), { recursive: true });

    const query = (op.parameters ?? []).filter((p) => p.in === "query");
    const bodyNode = op.requestBody?.content["application/json"]?.schema;
    const exports: string[] = [];
    const inputs: string[] = [];
    if (query.length) {
        exports.push(`export const zQuery = ${querySchema(query)};`);
        inputs.push("queryParams: zQuery");
    }
    if (bodyNode) {
        const root = resolve(bodyNode);
        const expr = root.properties
            ? object(root, 1)
            : zod(root, 1) + describe(root.description);
        exports.push(`export const zBody = ${expr};`);
        inputs.push("body: zBody");
    }
    if (exports.length) {
        await Deno.writeTextFile(
            join(dir, "schema", "inputs.ts"),
            `// GENERATED by \`deno task tikhub:scaffold\` from ${SPEC_URL}.\n` +
                `import { z } from "zod";\n\n` +
                `/** ${method.toUpperCase()} ${path} inputs. */\n` +
                exports.join("\n\n") + "\n",
        );
    } else {
        await Deno.remove(join(dir, "schema"), { recursive: true });
    }

    const categories = item.categories.filter((c) => c !== "tikhub");
    const description = englishDescription(op);
    const model = price === 0
        ? "{ kind: UsageModelKind.FREE }"
        : `{ kind: UsageModelKind.PER_CALL, consumes: { credit: "default", amount: ${price} } }`;
    const source = [
        `// GENERATED by \`deno task tikhub:scaffold\` from ${SPEC_URL}`,
        `// and Monid's listing (price). Edit the script, not this file.`,
        `import { defineEndpoint, UsageModelKind } from "@shared/core";`,
        ...(inputs.length
            ? [`import { ${
                inputs.map((i) => i.split(": ")[1]).join(", ")
            } } from "./schema/inputs.ts";`]
            : []),
        "",
        "export default defineEndpoint({",
        "meta: {",
        `displayName: ${
            q(`TikHub ${tagName(op)}: ${item.displayDescription}`)
        },`,
        `summary: ${q(item.displayDescription)},`,
        ...(description ? [`description: ${q(description)},`] : []),
        `docsUrl: ${
            q(`https://api.tikhub.io/#/${op.tags?.[0] ?? ""}/${op.operationId}`)
        },`,
        ...(categories.length
            ? [`categories: ${JSON.stringify(categories)},`]
            : []),
        "},",
        `request: { method: ${q(method.toUpperCase())}, path: ${q(path)} },`,
        ...(inputs.length
            ? [`input: { schema: { ${inputs.join(", ")} } },`]
            : []),
        `usage: { model: ${model} },`,
        "});",
        "",
    ].join("\n");
    await Deno.writeTextFile(join(dir, "endpoint.ts"), source);
    written++;
}

const fmt = await new Deno.Command("deno", { args: ["fmt", "--quiet", OUT] })
    .output();
if (!fmt.success) throw new Error(new TextDecoder().decode(fmt.stderr));
console.log(`${written} endpoints written, ${skipped.length} skipped`);
for (const line of skipped) console.log(`  skipped ${line}`);
for (const line of mismatched) console.log(`  price ${line}`);
