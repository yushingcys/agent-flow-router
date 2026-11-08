/**
 * Compile the test bundle once and write it where `deno task test` points
 * AGENT_FLOW_TEST_BUNDLE, so the test files read it instead of each
 * compiling every connector again.
 */
import { join } from "@std/path";
import { ensureDir } from "@std/fs";
import { compileTestBundle } from "@shared/testing";
import { OUTPUT_DIR } from "./lib.ts";

await ensureDir(OUTPUT_DIR);
await Deno.writeTextFile(
    join(OUTPUT_DIR, "test-bundle.json"),
    JSON.stringify(await compileTestBundle()),
);
