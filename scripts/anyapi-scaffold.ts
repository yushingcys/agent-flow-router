/**
 * deno task anyapi:scaffold
 *
 * AUTHORING-TIME generator for connectors/anyapi/endpoints/**: one endpoint
 * per AnyAPI SKU that Monid sells (its public listing), with
 *
 *   - the body schema mirrored from AnyAPI's OpenAPI document
 *     (api.getanyapi.com/openapi.json - the same normalized input schemas
 *     `GET /v1/apis/{sku}` serves, but keyless);
 *   - the rate card from AnyAPI's public catalog (api.getanyapi.com/catalog):
 *     `pricing.from`, the offer default routing serves at, as a flat
 *     PER_CALL or a linear base + per-unit line, plus any opt-in addon.
 *
 * Id = `anyapi#<sku>` (Monid's path minus its slash); the wire path is
 * `/v1/run/<sku>`. Output is committed and reviewed; refresh = re-run.
 */
import { join } from "@std/path";
import { REPO_ROOT } from "./lib.ts";

const ORIGIN = "https://api.getanyapi.com";
const MONID_URL = "https://api.monid.ai/public/v1/endpoints?provider=anyapi";
const OUT = join(REPO_ROOT, "connectors", "anyapi", "endpoints");
const MAX_DEPTH = 4;
/** Monid category ids that our closed vocabulary spells differently. */
const CATEGORY_ALIAS: Record<string, string> = {
    "academic-papers": "academic-search",
};

interface Node {
    type?: string | string[];
    enum?: unknown[];
    items?: Node;
    properties?: Record<string, Node>;
    required?: string[];
    additionalProperties?: boolean | Node;
    anyOf?: Node[];
    oneOf?: Node[];
    description?: string;
    default?: unknown;
    deprecated?: boolean;
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    minItems?: number;
    maxItems?: number;
    pattern?: string;
    format?: string;
}
interface Offer {
    model: "flat" | "linear";
    unit: string;
    baseUsd?: number;
    perUnitUsd?: number;
    maxUsd: number;
    addons?: { id: string; label: string; field: string; usd: number }[];
}
interface CatalogApi {
    slug: string;
    name: string;
    description: string;
    execution: { mode: string };
    pricing: { from: Offer; failoverMaxUsd: number };
}

async function json(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    return await res.json();
}

const spec = await json(`${ORIGIN}/openapi.json`) as {
    paths: Record<
        string,
        {
            post: {
                description: string;
                requestBody: {
                    content: { "application/json": { schema: Node } };
                };
                responses: Record<
                    string,
                    { content?: { "application/json"?: { schema: Node } } }
                >;
            };
        }
    >;
};
const catalog = new Map(
    ((await json(`${ORIGIN}/catalog`)).apis as CatalogApi[]).map((
        a,
    ) => [a.slug, a]),
);
const listing: { endpoint: string; categories: string[] }[] = [];
let cursor: string | undefined;
do {
    const page = await json(
        `${MONID_URL}&limit=100` +
            (cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""),
    );
    listing.push(...page.items);
    cursor = page.items.length ? page.cursor : undefined;
} while (cursor);

const q = (s: string) => JSON.stringify(s);
const key = (k: string) => /^[A-Za-z_$][\w$]*$/.test(k) ? k : q(k);
const clean = (s: string) => s.replace(/\s+/g, " ").trim();

function describe(node: Node): string {
    const parts = [
        node.description ? clean(node.description) : "",
        node.default !== undefined
            ? `Default \`${JSON.stringify(node.default)}\`.`
            : "",
    ].filter(Boolean);
    return parts.length ? `.describe(${q(parts.join(" "))})` : "";
}

function scalar(type: string, node: Node): string {
    switch (type) {
        case "string": {
            let z = node.format === "uri"
                ? "z.url()"
                : node.format === "email"
                ? "z.email()"
                : "z.string()";
            if (node.minLength !== undefined) z += `.min(${node.minLength})`;
            if (node.maxLength !== undefined) z += `.max(${node.maxLength})`;
            if (node.pattern) z += `.regex(new RegExp(${q(node.pattern)}))`;
            return z;
        }
        case "integer":
        case "number": {
            let z = type === "integer" ? "z.number().int()" : "z.number()";
            if (node.minimum !== undefined) z += `.min(${node.minimum})`;
            if (node.maximum !== undefined) z += `.max(${node.maximum})`;
            return z;
        }
        case "boolean":
            return "z.boolean()";
        case "null":
            return "z.null()";
        default:
            throw new Error(`unsupported type ${type}`);
    }
}

function zod(node: Node, depth: number): string {
    if (depth > MAX_DEPTH) return "z.any()";
    const alts = node.oneOf ?? node.anyOf;
    if (alts && !node.type) {
        return `z.union([${alts.map((a) => zod(a, depth)).join(", ")}])`;
    }
    if (node.enum?.length) {
        return node.enum.every((v) => typeof v === "string")
            ? `z.enum(${JSON.stringify(node.enum)})`
            : `z.literal(${JSON.stringify(node.enum)})`;
    }
    if (Array.isArray(node.type)) {
        const types = node.type.filter((t) => t !== "null");
        const inner = types.length === 1
            ? zod({ ...node, type: types[0] }, depth)
            : `z.union([${
                types.map((t) => zod({ ...node, type: t }, depth)).join(", ")
            }])`;
        return types.length < node.type.length ? `${inner}.nullable()` : inner;
    }
    switch (node.type) {
        case "array": {
            let z = `z.array(${zod(node.items ?? {}, depth + 1)})`;
            if (node.minItems !== undefined) z += `.min(${node.minItems})`;
            if (node.maxItems !== undefined) z += `.max(${node.maxItems})`;
            return z;
        }
        case "object":
            return node.properties
                ? object(node, depth + 1)
                : "z.record(z.string(), z.any())";
        case undefined:
            return "z.any()";
        default:
            return scalar(node.type, node);
    }
}

function object(node: Node, depth: number): string {
    const required = new Set(node.required ?? []);
    const fields = Object.entries(node.properties ?? {})
        .filter(([, v]) => !v.deprecated)
        .map(([k, v]) =>
            `${key(k)}: ${zod(v, depth)}${describe(v)}${
                required.has(k) ? "" : ".optional()"
            },`
        );
    const ctor = node.additionalProperties === false
        ? "z.strictObject"
        : "z.looseObject";
    return `${ctor}({${fields.join("\n")}})`;
}

const fmtUsd = (n: number) => Number(n.toFixed(8)).toString();
const consumes = (usd: number) =>
    `consumes: { credit: "default", amount: ${fmtUsd(usd)} }`;

/** Where a transcript SKU reports the audio length its minutes bill on. */
function durationPath(sku: string): string {
    const out = spec.paths[`/v1/run/${sku}`].post.responses["200"].content
        ?.["application/json"]?.schema.properties?.output;
    const data = (out?.anyOf?.[0] ?? out)?.properties?.data?.oneOf?.find((
        n,
    ) => n.type === "object");
    if (data?.properties?.durationSeconds) {
        return "$.output.data.durationSeconds";
    }
    if (data?.properties?.items?.items?.properties?.durationSeconds) {
        return "$.output.data.items[0].durationSeconds";
    }
    throw new Error(`${sku}: billed per audio minute, no durationSeconds`);
}

/** The rate card: model plus, for metered offers, estimate/evidence. */
function usage(sku: string, offer: Offer, body: Node) {
    const addon = offer.addons?.[0];
    if ((offer.addons?.length ?? 0) > 1) {
        throw new Error(`${sku}: more than one addon`);
    }
    const base = offer.model === "flat" ? offer.maxUsd : offer.baseUsd ?? 0;
    const per = offer.model === "linear" ? offer.perUnitUsd ?? 0 : 0;
    const metered = per > 0;
    const unit = offer.unit === "audio minute" ? "MINUTE" : "RESULT";
    const lineId = offer.unit === "audio minute"
        ? "minutes"
        : offer.unit === "asin"
        ? "asins"
        : "results";
    if (metered && !["result", "asin", "audio minute"].includes(offer.unit)) {
        throw new Error(`${sku}: unknown unit ${offer.unit}`);
    }
    const cap = Math.ceil(Number(((offer.maxUsd - base) / per).toFixed(6)));
    const flatLine = base > 0
        ? `kind: UsageModelKind.PER_CALL, ${consumes(base)}, label: ${
            q(metered || addon ? "base fee" : "request")
        }`
        : "";
    const unitLine = metered
        ? `kind: UsageModelKind.PER_UNIT, unit: Unit.${unit}, ${
            consumes(per)
        }, label: ${q(offer.unit === "asin" ? "ASINs" : offer.unit + "s")}`
        : "";
    const addonLine = addon
        ? `kind: UsageModelKind.PER_UNIT, unit: Unit.RESULT, ${
            consumes(addon.usd)
        }, label: ${q(addon.label)}`
        : "";
    const lines = [
        flatLine ? ["call", flatLine] : undefined,
        unitLine ? [lineId, unitLine] : undefined,
        addonLine ? [addon!.id, addonLine] : undefined,
    ].filter((l): l is string[] => l !== undefined);
    const composite = lines.length > 1;
    const model = composite
        ? `{ kind: UsageModelKind.COMPOSITE, components: { ${
            lines.map(([id, l]) => `${key(id)}: { ${l} }`).join(", ")
        } } }`
        : `{ ${lines[0][1]} }`;
    if (!metered && !addon) return { model, fns: [] as string[], unit: false };

    const unitKey = composite ? lineId : unit;
    const limit = body.properties?.limit;
    const est: string[] = [];
    const evd: string[] = [];
    if (metered) {
        if (offer.unit === "asin") {
            const n = `Math.min(data.input.body.asins.length, ${cap})`;
            est.push(`${key(unitKey)}: ${n}`);
            evd.push(`${key(unitKey)}: ${n}`);
        } else if (offer.unit === "audio minute") {
            est.push(`${key(unitKey)}: ${cap}`);
            evd.push(
                `${
                    key(unitKey)
                }: Math.min(Math.ceil((utils.json.optionalNum(data.output, ${
                    q(durationPath(sku))
                }) ?? 0) / 60), ${cap})`,
            );
        } else {
            est.push(
                `${key(unitKey)}: ${
                    typeof limit?.default === "number"
                        ? `Math.min(data.input.body.limit, ${cap})`
                        : limit
                        ? `Math.min(data.input.body.limit ?? ${cap}, ${cap})`
                        : cap
                }`,
            );
            evd.push(
                `${
                    key(unitKey)
                }: Math.min(utils.json.optionalNum(data.output, "$.items") ?? 0, ${cap})`,
            );
        }
    }
    if (addon) {
        const flag =
            `...(data.input.body.${addon.field} ? { ${addon.id}: 1 } : {})`;
        est.push(flag);
        evd.push(flag);
    }
    const fns = [
        `estimate: ({ data }) => ({ counts: { ${est.join(", ")} } }),`,
        `evidence: ({ data${
            evd.some((e) => e.includes("utils")) ? ", utils" : ""
        } }) => ({ counts: { ${evd.join(", ")} } }),`,
    ];
    return { model, fns, unit: metered || !!addon };
}

/** A top-level `anyOf: [{required: [a]}, {required: [b]}]` is a cross-field
 *  rule the compiled schema cannot carry - it becomes a note. */
function oneOfNote(body: Node): string | undefined {
    const alts = body.anyOf ?? body.oneOf;
    if (!alts) return undefined;
    const names = alts.map((a) => (a.required ?? []).join(" + "));
    return `Send at least one of: ${names.join(", ")}.`;
}

const skipped: string[] = [];
await Deno.remove(OUT, { recursive: true }).catch(() => {});
let written = 0;
for (
    const item of listing.sort((a, b) => a.endpoint.localeCompare(b.endpoint))
) {
    const sku = item.endpoint.slice(1);
    const api = catalog.get(sku);
    const op = spec.paths[`/v1/run/${sku}`]?.post;
    if (!api || !op) {
        skipped.push(`${sku}: not in AnyAPI's catalog`);
        continue;
    }
    if (api.execution.mode !== "sync") {
        skipped.push(`${sku}: execution mode ${api.execution.mode}`);
        continue;
    }
    const body = op.requestBody.content["application/json"].schema;
    const platform = sku.split(".")[0].replace(/_/g, "-");
    const dir = join(OUT, platform, sku.replace(/[._]/g, "-"));
    await Deno.mkdir(join(dir, "schema"), { recursive: true });
    await Deno.writeTextFile(
        join(dir, "schema", "inputs.ts"),
        `// GENERATED by \`deno task anyapi:scaffold\` from ${ORIGIN}/openapi.json.\n` +
            `import { z } from "zod";\n\n` +
            `/** POST /v1/run/${sku} body. */\n` +
            `export const zBody = ${object(body, 1)};\n`,
    );

    const { model, fns, unit } = usage(sku, api.pricing.from, body);
    const limitDefault = body.properties?.limit?.default;
    const bodyBinding = typeof limitDefault === "number" && unit
        ? `zBody.extend({ limit: zBody.shape.limit.unwrap().default(${limitDefault}) })`
        : "zBody";
    const docsUrl = /\]\((https:\/\/getanyapi\.com\/api\/[^)]+)\)/.exec(
        op.description,
    )?.[1];
    const categories = [
        ...new Set(
            item.categories.filter((c) => c !== "anyapi").map((c) =>
                CATEGORY_ALIAS[c] ?? c
            ),
        ),
    ];
    const description = clean(api.description);
    const summary = /^.+?[.!?](?=\s|$)/.exec(description)?.[0] ?? description;
    const note = oneOfNote(body);
    const coreImports = [
        "defineEndpoint",
        ...(model.includes("Unit.") ? ["Unit"] : []),
        "UsageModelKind",
    ];
    const source = [
        `// GENERATED by \`deno task anyapi:scaffold\` from ${ORIGIN}/openapi.json,`,
        `// ${ORIGIN}/catalog (pricing) and Monid's listing. Edit the script, not this file.`,
        `import { ${coreImports.join(", ")} } from "@shared/core";`,
        `import { zQuery } from "../../../schema/query.ts";`,
        `import { zBody } from "./schema/inputs.ts";`,
        "",
        "export default defineEndpoint({",
        "meta: {",
        `displayName: ${q(`AnyAPI ${api.name}`)},`,
        `summary: ${
            q(summary.length > 200 ? summary.slice(0, 197) + "..." : summary)
        },`,
        `description: ${q(description)},`,
        ...(docsUrl ? [`docsUrl: ${q(docsUrl)},`] : []),
        ...(categories.length
            ? [`categories: ${JSON.stringify(categories)},`]
            : []),
        ...(note ? [`notes: [${q(note)}],`] : []),
        "},",
        `endpoint: ${q(`/${sku}`)},`,
        `request: { method: "POST", path: ${q(`/v1/run/${sku}`)} },`,
        `input: { schema: { body: ${bodyBinding}, queryParams: zQuery } },`,
        `usage: { model: ${model},`,
        ...fns,
        "},",
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
