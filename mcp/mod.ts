import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { type Bundle, sealUnit, zRunInput } from "@shared/core";
import {
    directTransport,
    Engine,
    type EngineCtx,
} from "@agent-flow/connector-engine";

/** MCP presentation only. The host owns execution and any access controls. */
export function createToolServer(host: {
    name: string;
    version: string;
    tools: Tool[];
    call: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}): Server {
    const server = new Server(
        { name: host.name, version: host.version },
        { capabilities: { tools: {} } },
    );
    server.setRequestHandler(
        ListToolsRequestSchema,
        () => ({ tools: host.tools }),
    );
    server.setRequestHandler(
        CallToolRequestSchema,
        async (
            req: {
                params: { name: string; arguments?: Record<string, unknown> };
            },
        ) => {
            try {
                const out = await host.call(
                    req.params.name,
                    req.params.arguments ?? {},
                );
                return {
                    content: [{
                        type: "text",
                        text: typeof out === "string"
                            ? out
                            : JSON.stringify(out, null, 1),
                    }],
                };
            } catch (e) {
                return {
                    content: [{
                        type: "text",
                        text: String((e as Error).message ?? e),
                    }],
                    isError: true,
                };
            }
        },
    );
    return server;
}

const STOP = new Set(
    "a an and api by for from get i in into is it me my of on or the to with"
        .split(" "),
);

/** Lowercase words with a light suffix strip, so "prices" meets "price". */
function tokenize(text: string): string[] {
    return text.toLowerCase().split(/[^a-z0-9]+/).filter((word) =>
        word && !STOP.has(word)
    ).map((word) => {
        for (const suffix of ["ing", "ers", "er", "ed", "es", "s", "e"]) {
            if (
                word.endsWith(suffix) && word.length - suffix.length >= 3
            ) return word.slice(0, -suffix.length);
        }
        return word;
    });
}

/** Words plus adjacent pairs, so "text to speech" beats "speech to text". */
const withPairs = (words: string[]) => [
    ...words,
    ...words.slice(1).map((word, i) => `${words[i]} ${word}`),
];

// A word in the provider or name says more than the same word in prose.
const PROVIDER = 4, NAME = 3, CATEGORY = 2, PATH = 1.5, SUMMARY = 1;

const FIELDS = new WeakMap<object, Map<string, number>>();
function fieldsOf(doc: Bundle["endpoints"][string]) {
    let weights = FIELDS.get(doc);
    if (weights) return weights;
    weights = new Map();
    const add = (text: string, weight: number) => {
        for (const word of withPairs(tokenize(text))) {
            weights!.set(word, Math.max(weights!.get(word) ?? 0, weight));
        }
    };
    add(doc.meta.summary, SUMMARY);
    add(doc.id.slice(doc.id.indexOf("#") + 1), PATH);
    add((doc.meta.categories ?? []).join(" "), CATEGORY);
    add(doc.meta.displayName, NAME);
    add(doc.provider, PROVIDER);
    FIELDS.set(doc, weights);
    return weights;
}

// ponytail: IDF-weighted keyword fields plus per-provider diversity, measured
// by mcp/discover.test.ts; reach for embeddings only when that eval cannot pass.
export function rankEndpoints(
    docs: Bundle["endpoints"][string][],
    query: string,
    ready: ReadonlySet<string> = new Set(),
) {
    const terms = [...new Set(withPairs(tokenize(query)))];
    const fields = docs.map(fieldsOf);
    const rarity = (term: string) =>
        Math.log(
            1 +
                docs.length /
                    Math.max(1, fields.filter((f) => f.has(term)).length),
        );
    // A pair settles word order at half its rarer word's weight, so it never
    // outvotes a word the endpoint lacks.
    const idf = terms.map((term) =>
        term.includes(" ")
            ? Math.min(...term.split(" ").map(rarity)) / 2
            : rarity(term)
    );
    const scored = docs.map((doc, i) => ({
        doc,
        score: terms.reduce(
            (sum, term, t) => sum + (fields[i].get(term) ?? 0) * idf[t],
            0,
        ),
    })).filter((row) => row.score > 0)
        .sort((a, b) =>
            b.score - a.score ||
            Number(ready.has(b.doc.provider)) -
                Number(ready.has(a.doc.provider)) ||
            a.doc.meta.displayName.length - b.doc.meta.displayName.length
        );
    // Halve each further pick from the same provider so one provider's
    // near-duplicates cannot fill the page.
    const seen = new Map<string, number>();
    return scored.map((row) => {
        const n = seen.get(row.doc.provider) ?? 0;
        seen.set(row.doc.provider, n + 1);
        return { ...row, score: row.score / 2 ** n };
    }).sort((a, b) => b.score - a.score).map(({ doc }) => doc);
}

const TOOLS: Tool[] = [
    {
        name: "discover",
        description:
            "Find executable connector endpoints by task. Uses this router's installed catalog.",
        inputSchema: {
            type: "object",
            properties: {
                query: { type: "string" },
                limit: {
                    type: "integer",
                    minimum: 1,
                    maximum: 100,
                    default: 10,
                },
            },
            required: ["query"],
        },
    },
    {
        name: "inspect",
        description:
            "Show an endpoint's inputs, authentication field names, and provider usage model. Never returns credential values.",
        inputSchema: {
            type: "object",
            properties: { endpoint: { type: "string" } },
            required: ["endpoint"],
        },
    },
    {
        name: "run",
        description:
            "Execute an installed endpoint using the operator's provider keys. The provider may charge your account. Input follows inspect: {body?, queryParams?, pathParams?}.",
        inputSchema: {
            type: "object",
            properties: {
                endpoint: { type: "string" },
                input: { type: "object" },
            },
            required: ["endpoint", "input"],
        },
    },
];

/** Standalone BYOK host. No persistent credential store, account, or billing. */
export function createRouterServer(
    bundle: Bundle,
    ctx: EngineCtx = { transport: directTransport() },
): Server {
    const engine = new Engine(ctx);
    const executable = Object.values(bundle.endpoints).filter((doc) =>
        !doc.resources || !!ctx.resources
    );
    const endpoint = (id: string) => {
        const doc = bundle.endpoints[id];
        if (!doc) throw new Error(`unknown endpoint ${id}; use discover`);
        if (doc.resources && !ctx.resources) {
            throw new Error(
                `${id} requires a host with resource ownership support`,
            );
        }
        return doc;
    };
    return createToolServer({
        name: "agent-flow-router",
        version: "0.1.0",
        tools: TOOLS,
        async call(name, args) {
            if (name === "discover") {
                const { query, limit } = z.object({
                    query: z.string(),
                    limit: z.number().int().min(1).max(100).default(10),
                }).strict().parse(args);
                return {
                    endpoints: rankEndpoints(executable, query).slice(0, limit)
                        .map((doc) => ({
                            id: doc.id,
                            name: doc.meta.displayName,
                            summary: doc.meta.summary,
                        })),
                };
            }
            if (name === "inspect") {
                const parsed = z.object({ endpoint: z.string() }).strict()
                    .parse(args);
                const doc = endpoint(parsed.endpoint);
                return {
                    id: doc.id,
                    meta: doc.meta,
                    input: doc.input,
                    auth: doc.auth.credentials,
                    usage: {
                        model: doc.usage.model,
                        credits: doc.usage.credits,
                    },
                };
            }
            if (name === "run") {
                const parsed = z.object({
                    endpoint: z.string(),
                    input: zRunInput,
                }).strict().parse(args);
                const doc = endpoint(parsed.endpoint);
                const loaded = await engine.load(sealUnit(bundle, doc.id));
                return await loaded.run(parsed.input);
            }
            throw new Error(`unknown tool ${name}`);
        },
    });
}
