import { assert, assertEquals, assertMatch } from "@std/assert";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { directTransport } from "@agent-flow/connector-engine";
import { compileToOutput } from "../scripts/lib.ts";
import { createRouterServer, createToolServer } from "./mod.ts";

const { bundle } = await compileToOutput();

Deno.test("standalone router discovers, inspects and executes using caller-supplied access", async () => {
    let calls = 0;
    const reply = JSON.parse(
        await Deno.readTextFile(
            new URL(
                "../connectors/exa/endpoints/search/fixtures/happy.json",
                import.meta.url,
            ),
        ),
    ).calls[0].res.body;
    const server = createRouterServer(bundle, {
        transport: directTransport({
            params: () => Promise.resolve({ apiKey: "router-test-secret" }),
            fetch: ((_url: string, init?: RequestInit) => {
                assertEquals(
                    new Headers(init?.headers).get("x-api-key"),
                    "router-test-secret",
                );
                calls++;
                return Promise.resolve(Response.json(reply));
            }) as typeof fetch,
        }),
    });
    const client = new Client({ name: "router-test", version: "0" });
    const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
    await server.connect(serverSide);
    await client.connect(clientSide);
    try {
        assertEquals(
            (await client.listTools()).tools.map((tool: { name: string }) =>
                tool.name
            ),
            ["discover", "inspect", "run"],
        );
        const call = async (name: string, args: Record<string, unknown>) =>
            await client.callTool({ name, arguments: args }) as {
                isError?: boolean;
                content: { text: string }[];
            };
        const found = await call("discover", { query: "exa search" });
        assert(!found.isError);
        assert(found.content[0].text.includes("exa#search"));
        const inspected = await call("inspect", { endpoint: "exa#search" });
        assert(!inspected.isError);
        assert(!inspected.content[0].text.includes("router-test-secret"));
        assertEquals(calls, 0);
        const result = await call("run", {
            endpoint: "exa#search",
            input: { body: { query: "battery suppliers", numResults: 2 } },
        });
        assert(!result.isError, result.content[0].text);
        assertEquals(calls, 1);
        const output = JSON.parse(result.content[0].text);
        assertEquals(output.httpStatus, 200);
        assert(output.usage);
        assert(!("receipt" in output));
        assert(!result.content[0].text.includes("router-test-secret"));
        const invalid = await call("run", {
            endpoint: "exa#search",
            input: {},
            approved: true,
        });
        assert(invalid.isError);
        assertEquals(calls, 1);
        const resource = Object.values(bundle.endpoints).find((doc) =>
            doc.resources
        )!;
        const unsupported = await call("run", {
            endpoint: resource.id,
            input: {},
        });
        assert(unsupported.isError);
        assertMatch(unsupported.content[0].text, /resource ownership/);
        assertEquals(calls, 1);
    } finally {
        await client.close();
        await server.close();
    }
});

Deno.test("shared MCP adapter preserves a host's refusal as a tool error", async () => {
    const server = createToolServer({
        name: "restricted-host",
        version: "0",
        tools: [{ name: "run", inputSchema: { type: "object" } }],
        call: () => Promise.reject(new Error("execution denied by host")),
    });
    const client = new Client({ name: "test", version: "0" });
    const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
    await server.connect(serverSide);
    await client.connect(clientSide);
    try {
        const out = await client.callTool({ name: "run", arguments: {} });
        assertEquals(out.isError, true);
    } finally {
        await client.close();
        await server.close();
    }
});
