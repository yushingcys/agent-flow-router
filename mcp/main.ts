import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { compileToOutput } from "../scripts/lib.ts";
import { createRouterServer } from "./mod.ts";

const { bundle } = await compileToOutput();
await createRouterServer(bundle).connect(new StdioServerTransport());
