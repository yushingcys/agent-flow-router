/**
 * deno task strale:scaffold
 *
 * AUTHORING-TIME generator for `connectors/strale/endpoints/*`: one endpoint
 * per Strale path that Monid sells (monid.ai/tools, provider
 * `api.strale.io`), executed through Strale's keyed REST API.
 *
 *   - the endpoint SET comes from Monid's public listing, so ids are
 *     `strale#<Monid path>` and `monid:prices` prices them;
 *   - Monid's paths are Strale's x402 pay-per-call routes. `/x402/<slug>`
 *     and `/x402/v2/<slug>` differ only in the x402 protocol version (the
 *     402 challenge format), never in the capability, its inputs or its
 *     price, so both run the same capability. With a key, a capability
 *     runs as `POST /v1/do {capability_slug, inputs, max_price_cents}` and
 *     a solution (bundle) as `POST /v1/solutions/<slug>/execute {inputs,
 *     max_price_cents}`; the def declares Monid's path as `endpoint:`;
 *   - names, descriptions, input schemas and EUR prices come from Strale's
 *     catalog (`GET /v1/capabilities`, `GET /v1/solutions/<slug>`).
 *
 * Monid paths with no live capability or solution are skipped and listed.
 * Re-run to refresh; review the git diff.
 */
import { emptyDir } from "@std/fs";
import { fromFileUrl, join } from "@std/path";

const STRALE = "https://api.strale.io";
const MONID = "https://api.monid.ai/public/v1/endpoints?provider=api.strale.io";
const OUT = fromFileUrl(
    new URL("../connectors/strale/endpoints/", import.meta.url),
);

type JsonSchema = {
    type?: string;
    description?: string;
    enum?: unknown[];
    items?: JsonSchema;
    properties?: Record<string, JsonSchema>;
    required?: string[];
    anyOf?: { required?: string[] }[];
    minLength?: number;
    maxLength?: number;
    minimum?: number;
    maximum?: number;
};
type Item = {
    slug: string;
    name: string;
    description: string;
    category: string;
    price_cents: number;
    is_free_tier?: boolean;
    data_source?: string;
    input_schema: JsonSchema;
    steps?: { capability_slug: string }[];
};

async function json(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    return await res.json();
}

async function loadMonid() {
    const paths: string[] = [];
    let cursor: string | undefined;
    do {
        const page = await json(
            MONID + "&limit=50" +
                (cursor ? "&cursor=" + encodeURIComponent(cursor) : ""),
        );
        paths.push(...page.items.map((i: { endpoint: string }) => i.endpoint));
        cursor = page.items.length ? page.cursor : undefined;
    } while (cursor);
    return [...new Set(paths)].sort();
}

const CATEGORIES: Record<string, string[]> = {
    "agent-tooling": ["developer-tools"],
    "company-data": ["company-enrichment"],
    "competitive-intelligence": ["company-enrichment", "seo"],
    "compliance": ["compliance"],
    "content-writing": ["text-processing"],
    "data-extraction": ["reference-data"],
    "data-processing": ["data-processing"],
    "developer-tools": ["developer-tools"],
    "document-extraction": ["text-processing"],
    "file-conversion": ["data-processing"],
    "financial": ["financial-data"],
    "monitoring": ["domain-intelligence"],
    "sales-outreach": ["people-enrichment", "company-enrichment"],
    "security": ["developer-tools"],
    "security-risk": ["domain-intelligence"],
    "text-processing": ["text-processing"],
    "utility": ["domain-intelligence"],
    "validation": ["data-validation"],
    "web-intelligence": ["domain-intelligence"],
    "web-scraping": ["web-scraping"],
    "web3": ["onchain-data"],
};
const categoriesOf = (item: Item) => {
    // Strale files registry lookups under several categories.
    if (/company|kyb|charity/.test(item.slug)) return ["company-enrichment"];
    const out = CATEGORIES[item.category];
    if (!out) throw new Error(`unmapped Strale category ${item.category}`);
    return out;
};

/** No em or en dashes in generated text (repo style). */
const clean = (s: string) =>
    s.replace(/\s*[\u2013\u2014]\s*/g, " - ").replace(/\s+/g, " ").trim();
const q = (s: string) => JSON.stringify(clean(s));
const key = (name: string) =>
    /^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name);
const sentence = (s: string) => clean(s).replace(/([^.!?])$/, "$1.");

function zodOf(s: JsonSchema): string {
    let z: string;
    if (s.enum?.length && s.enum.every((v) => typeof v === "string")) {
        z = `z.enum(${JSON.stringify(s.enum)})`;
    } else if (s.type === "string") {
        z = "z.string()";
        if (s.minLength !== undefined) z += `.min(${s.minLength})`;
        if (s.maxLength !== undefined) z += `.max(${s.maxLength})`;
    } else if (s.type === "integer" || s.type === "number") {
        z = s.type === "integer" ? "z.number().int()" : "z.number()";
        if (s.minimum !== undefined) z += `.min(${s.minimum})`;
        if (s.maximum !== undefined) z += `.max(${s.maximum})`;
    } else if (s.type === "boolean") {
        z = "z.boolean()";
    } else if (s.type === "array") {
        z = `z.array(${s.items ? zodOf(s.items) : "z.unknown()"})`;
    } else if (s.type === "object") {
        z = "z.record(z.string(), z.unknown())";
    } else {
        z = "z.unknown()";
    }
    return s.description ? z + `.describe(${q(s.description)})` : z;
}

function inputsFile(item: Item) {
    const schema = item.input_schema ?? {};
    const props = schema.properties ?? {};
    const required = new Set(schema.required ?? []);
    for (const name of required) {
        if (!props[name]) throw new Error(`${item.slug}: required ${name}?`);
    }
    const fields = Object.keys(props).sort().map((name) =>
        `    ${key(name)}: ${zodOf(props[name])}${
            required.has(name) ? "" : ".optional()"
        },\n`
    ).join("");
    return `// Generated by scripts/strale-scaffold.ts - do not edit by hand.\n` +
        `import { z } from "zod";\n\n` +
        `/** Strale \`${item.slug}\` inputs (catalog input_schema). */\n` +
        `export const zBody = z.object({\n${fields}});\n`;
}

function endpointFile(o: {
    path: string;
    item: Item;
    solution: boolean;
    twin?: string;
}) {
    const { path, item, solution, twin } = o;
    const free = !solution && item.is_free_tier === true;
    const eur = item.price_cents / 100;
    const groups = (item.input_schema?.anyOf ?? [])
        .map((g) => g.required ?? [])
        .filter((g) => g.length);
    const notes = [
        groups.length
            ? "Provide at least one of: " +
                groups.map((g) => g.map((f) => `\`${f}\``).join(" + "))
                    .join(", ") +
                "."
            : "",
        twin
            ? `Runs the same Strale capability as \`${twin}\`; Monid lists ` +
                "both x402 protocol versions of it."
            : "",
    ].filter(Boolean);
    const description = [
        sentence(item.description),
        solution && item.steps?.length
            ? "Bundles: " +
                item.steps.map((s) => s.capability_slug).join(", ") + "."
            : "",
        item.data_source ? `Source: ${sentence(item.data_source)}` : "",
    ].filter(Boolean).join(" ");
    const vendorPath = solution
        ? `/v1/solutions/${item.slug}/execute`
        : "/v1/do";
    const body = solution
        ? `{ inputs: data.input.body ?? {}, max_price_cents: ${item.price_cents} }`
        : `{ capability_slug: ${
            JSON.stringify(item.slug)
        }, inputs: data.input.body ?? {}, max_price_cents: ${item.price_cents}, timeout_seconds: 60 }`;
    const lines = [
        `// Generated by scripts/strale-scaffold.ts - do not edit by hand.`,
        free
            ? `import { defineEndpoint, UsageModelKind } from "@shared/core";`
            : `import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";`,
        `import { zBody } from "./schema/inputs.ts";`,
        ``,
        `/** POST ${vendorPath}${
            solution ? "" : ` - capability \`${item.slug}\``
        }, EUR ${eur.toFixed(2)}${free ? " (free with a key)" : ""}. */`,
        `export default defineEndpoint({`,
        `    meta: {`,
        `        displayName: ${q(item.name)},`,
        `        summary: ${q(item.description)},`,
        `        description: ${JSON.stringify(description)},`,
        `        categories: ${JSON.stringify(categoriesOf(item))},`,
        ...(notes.length ? [`        notes: ${JSON.stringify(notes)},`] : []),
        `    },`,
        `    endpoint: ${q(path)},`,
        `    request: { method: "POST", path: ${q(vendorPath)} },`,
        ...(solution
            ? [`    timeouts: { requestMs: 290_000, runMs: 300_000 },`]
            : []),
        `    input: {`,
        `        schema: { body: zBody },`,
        `        toRequest: ({ data }) => ({ body: ${body} }),`,
        `    },`,
        free
            ? `    usage: { model: { kind: UsageModelKind.FREE } },`
            : `    usage: { model: { kind: UsageModelKind.PER_UNIT, unit: Unit.RESULT, label: "charged run", consumes: { credit: "default", amount: ${eur} } } },`,
        `});`,
        ``,
    ];
    return lines.join("\n");
}

const [monid, catalog] = await Promise.all([
    loadMonid(),
    json(STRALE + "/v1/capabilities"),
]);
const capabilities = new Map<string, Item>(
    catalog.capabilities.map((c: Item) => [c.slug, c]),
);
const solutions = new Map<string, Item>();
for (const path of monid) {
    const m = path.match(/^\/x402\/(?:v2\/)?solutions\/(.+)$/);
    if (!m) continue;
    const res = await fetch(`${STRALE}/v1/solutions/${m[1]}`);
    if (res.ok) solutions.set(m[1], await res.json());
    else await res.body?.cancel();
}

const slugOf = (path: string) => path.replace(/^\/x402\/(v2\/)?/, "");
await emptyDir(OUT);
const skipped: string[] = [];
let written = 0;
for (const path of monid) {
    const rest = slugOf(path);
    const solution = rest.startsWith("solutions/");
    const item = solution
        ? solutions.get(rest.slice("solutions/".length))
        : capabilities.get(rest);
    if (!item) {
        skipped.push(path);
        continue;
    }
    const twin = monid.find((p) => p !== path && slugOf(p) === rest);
    const dir = join(OUT, path.slice(1).replace(/\//g, "-"));
    await Deno.mkdir(join(dir, "schema"), { recursive: true });
    await Deno.writeTextFile(
        join(dir, "endpoint.ts"),
        endpointFile({ path, item, solution, twin: twin?.slice(1) }),
    );
    await Deno.writeTextFile(
        join(dir, "schema", "inputs.ts"),
        inputsFile(item),
    );
    written++;
}

const fmt = await new Deno.Command("deno", { args: ["fmt", "--quiet", OUT] })
    .output();
if (!fmt.success) throw new Error(new TextDecoder().decode(fmt.stderr));
console.log(`${written} endpoints written to ${OUT}`);
if (skipped.length) {
    console.log("no live Strale capability or solution (skipped):", skipped);
}
