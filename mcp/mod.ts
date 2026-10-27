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

// ponytail: keyword overlap ranking; replace when measured discovery misses
// justify a different search implementation.
export function rankEndpoints(
    docs: Bundle["endpoints"][string][],
    query: string,
    ready: ReadonlySet<string> = new Set(),
) {
    const terms = query.toLowerCase().split(/\W+/).filter(Boolean);
    return docs.map((doc) => {
        const hay = [
            doc.id,
            doc.meta.displayName,
            doc.meta.summary,
            ...(doc.meta.categories ?? []),
        ]
            .join(" ").toLowerCase();
        return {
            doc,
            score: terms.filter((term) => hay.includes(term)).length,
        };
    }).filter((row) => row.score > 0)
        .sort((a, b) =>
            b.score - a.score ||
            Number(ready.has(b.doc.provider)) -
                Number(ready.has(a.doc.provider))
        )
        .map(({ doc }) => doc);
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
