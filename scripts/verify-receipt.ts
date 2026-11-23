/**
 * deno task verify-receipt <receipt.json|->
 *   [--input <json-or-file>] [--hosted-output <json-or-file>]
 *   [--hosted-status <code>] [--keys <file>] [--keys-url <url>]
 *   [--no-replay] [--deterministic]
 *
 * Check a signed hosted receipt against the public keys and this
 * checkout, then optionally replay the call through the local engine
 * with the provider key in the environment. No Agent Flow API key.
 *
 * `--input` is the run input (`{body?, queryParams?, pathParams?}`),
 * as a file, inline JSON, or `-` for stdin. The receipt argument is a
 * file path or `-`. `--hosted-output` is the stored output the gateway
 * hashed, not the whole run record.
 */
import { Command } from "@cliffy/command";
import { type Bundle, type RunInput, sealUnit } from "@shared/core";
import { directTransport, Engine } from "@agent-flow/connector-engine";
import { validateAgainst } from "../engine/validate.ts";
import {
    DEFAULT_KEYS_URL,
    fetchVerifyKeys,
    formatReport,
    parseSignedReceipt,
    parseVerifyKeys,
    publicUpstream,
    readJsonInput,
    stdinConflict,
    verifyHostedCall,
} from "../shared/receipt/mod.ts";
import { compileToOutput } from "./lib.ts";
import { admitInto, KvResourceStore, persistEffects } from "./store/kv.ts";

const { options, args } = await new Command()
    .name("verify-receipt")
    .description(
        "Verify a hosted Agent Flow receipt and optionally replay the " +
            "call with your own provider key. No Agent Flow API key.",
    )
    .arguments("<receipt:string>")
    .option(
        "--input <json:string>",
        "Original run input: a JSON file, inline JSON, or - for stdin. " +
            "{body?, queryParams?, pathParams?}.",
    )
    .option(
        "--hosted-output <json:string>",
        "Stored hosted output (file, inline JSON, or -) for the signed " +
            "outputHash and a diff. Not the whole run record.",
    )
    .option(
        "--hosted-status <code:number>",
        "HTTP status the hosted gateway reported, compared with the replay.",
    )
    .option(
        "--keys <file:string>",
        "Offline public keys JSON ({keys:[...]} or a bare array). " +
            "Skips the network.",
    )
    .option(
        "--keys-url <url:string>",
        "Public keys endpoint.",
        { default: DEFAULT_KEYS_URL },
    )
    .option(
        "--no-replay",
        "Check the signature and the catalog binding without calling " +
            "the provider.",
    )
    .option(
        "--deterministic",
        "Treat outputHash equality as conclusive for this endpoint.",
    )
    .parse(Deno.args);

if (stdinConflict([args[0], options.input, options.hostedOutput])) {
    console.error(
        "[verify-receipt] only one of the receipt, --input, and " +
            "--hosted-output can read stdin",
    );
    Deno.exit(1);
}

const receipt = await readJsonInput(args[0], "receipt");
const input = options.input === undefined
    ? undefined
    : await readJsonInput(options.input, "--input", { inline: true });
const hostedOutput = options.hostedOutput === undefined
    ? undefined
    : await readJsonInput(options.hostedOutput, "--hosted-output", {
        inline: true,
    });

const keysArg = Deno.args.some((arg) =>
    arg === "--keys-url" || arg.startsWith("--keys-url=")
);
if (options.keys && keysArg) {
    console.error("[verify-receipt] using --keys; ignoring --keys-url");
}
const keys = options.keys
    ? parseVerifyKeys(
        JSON.parse(await Deno.readTextFile(options.keys)),
    )
    : await fetchVerifyKeys(options.keysUrl);

const parsed = parseSignedReceipt(receipt);
let bundle: Bundle | undefined;
let endpoint:
    | {
        id: string;
        docHash: string;
        upstream: string;
        outputSchema: Bundle["endpoints"][string]["output"]["schema"];
    }
    | null
    | undefined;
if (parsed.ok) {
    const compiled = await compileToOutput();
    bundle = compiled.bundle;
    console.error(
        `[verify-receipt] catalog ${
            compiled.cacheHit ? "cache hit" : "compiled"
        }`,
    );
    const doc = bundle.endpoints[parsed.receipt.payload.endpoint];
    endpoint = doc
        ? {
            id: doc.id,
            docHash: doc.hash,
            upstream: publicUpstream(doc.request.url),
            outputSchema: doc.output.schema,
        }
        : null;
}

const replay = options.replay === false ? false : async () => {
    if (!bundle || !parsed.ok) {
        throw new Error("catalog was not loaded");
    }
    const endpointId = parsed.receipt.payload.endpoint;
    console.error(
        `[verify-receipt] replaying ${endpointId} with the provider ` +
            "key in this environment",
    );
    const store = await KvResourceStore.open();
    const log = (line: string) => console.error(`[verify-receipt] ${line}`);
    try {
        const engine = new Engine({
            transport: directTransport(),
            resources: store,
            admit: admitInto(store, log),
            scopeKey: "local",
        });
        const loaded = await engine.load(sealUnit(bundle, endpointId));
        const result = await loaded.run(input as RunInput);
        await persistEffects(store, result.resources, log);
        return {
            httpStatus: result.httpStatus,
            output: result.output,
            isProviderError: result.isProviderError,
        };
    } finally {
        store.close();
    }
};

const report = await verifyHostedCall({
    receipt,
    keys,
    endpoint,
    input,
    hostedOutput,
    hostedStatus: options.hostedStatus,
    replay,
    deterministic: options.deterministic === true,
    validateOutput: validateAgainst,
});

console.log(formatReport(report));
if (report.exitCode !== 0) Deno.exit(report.exitCode);
