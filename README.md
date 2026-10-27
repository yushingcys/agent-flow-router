# Agent Flow Router

An open-source tool router for agents. Discover tools, inspect their schemas, and execute provider APIs through one MCP connection using your own API keys.

The router includes the connector catalog, compiler, execution engine, usage measurement, and a standalone MCP server. It works without an Agent Flow account or a private repository. It does not include Agent Flow's credential vault, saved browser sessions, approval manager, wallet, or hosted service. Those remain in the separate private product.

## Run it

Requires Deno 2.x. Clone this repository:

```bash
git clone https://github.com/yushingcys/agent-flow-router.git
cd agent-flow-router
deno task check
deno task test
```

Supply your provider key through your shell or harness environment, then start the MCP server:

```bash
export EXA_API_KEY='your-provider-key'
deno task -q mcp
```

The MCP server speaks JSON-RPC over stdin/stdout; it is normally started by your agent harness. Configure OpenCode with an absolute path to the checkout:

```json
{
    "mcp": {
        "agent-flow-router": {
            "type": "local",
            "command": [
                "deno",
                "task",
                "-q",
                "--config",
                "/path/to/agent-flow-router/deno.json",
                "mcp"
            ]
        }
    }
}
```

Set keys outside committed configuration. The canonical spelling is `<PROVIDER>_CREDENTIALS_<FIELD>`; `<PROVIDER>_API_KEY` is also supported for `apiKey`. This is a basic environment resolver, not persistent credential management. Provider calls may incur charges directly on your provider account.

## Tools

| Tool       | Behavior                                                                          |
| ---------- | --------------------------------------------------------------------------------- |
| `discover` | Search installed endpoints by task.                                               |
| `inspect`  | Return input schemas, authentication field names, and the provider's usage model. |
| `run`      | Validate and execute an installed endpoint with the operator's access.            |

Discovery and inspection never resolve credential values. The standalone MCP server excludes endpoints requiring a resource ownership store. Applications that need those endpoints can provide the engine's `ResourceReader` and resource lifecycle host, or use the existing local CLI host.

```bash
deno task catalog providers
deno task catalog inspect 'exa#search'
deno task engine:run 'exa#search' --body '{"query":"battery suppliers","numResults":2}'
```

The catalog is connector code, not a grant of provider access or redistribution rights. Configure and use each provider under its applicable terms. Usage measurements are provider units; the router does not debit a customer balance.

## Embed it

- `engine/mod.ts`: `Engine`, `Transport`, `ParamsResolver`, and execution contracts.
- `shared/core/mod.ts`: connector definitions, schemas, catalog readers, and bundle contracts.
- `mcp/mod.ts`: standalone `createRouterServer`, reusable `createToolServer`, and `rankEndpoints`.
- `scripts/lib.ts`: compile the source catalog into a reusable bundle.

Hosts can use `createToolServer` to expose their own controlled execution callback. The adapter does not grant permissions. A managed host must authenticate callers, validate requests against its trusted catalog, enforce approvals and limits, and only then resolve secrets and dispatch. Do not expose `Transport.execute(PreparedRequest)` as an unrestricted remote credential-injection API.

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for connector authoring and [AGENT.md](AGENT.md) for repository conventions.

```bash
deno fmt --check
deno task lint
deno task check
deno task boundary:check
deno task ids:check
deno task version:check
deno task test
```

Replay tests use fixtures and do not call paid providers. Run `deno task test:live` only when you intend to make real provider calls. Do not commit keys, personal browser state, or private product files.

## License

MIT. The engine, compiler, and many connector definitions derive from Monid's MIT-licensed connector framework. See [LICENSE](LICENSE) and [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES). This repository begins with a fresh history containing only the extracted public router.
