import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import type { Json } from "@shared/core";
import { validateAgainst } from "../../engine/validate.ts";
import {
    diffJson,
    formatReport,
    hashReceiptInput,
    hashReceiptOutput,
    type ReceiptPayload,
    signCanonical,
    type SignedReceipt,
    verifyHostedCall,
} from "./mod.ts";

const INPUT = {
    body: { query: "batteries", apiKey: "sekret" },
    headers: { authorization: "Bearer sekret" },
};
const HOSTED = { title: "a", access_token: "sekret" };
const SCHEMA: Record<string, Json> = {
    type: "object",
    additionalProperties: false,
    required: ["title"],
    properties: { title: { type: "string" } },
};

async function minted(extra: Partial<ReceiptPayload> = {}) {
    const pair = await crypto.subtle.generateKey(
        "Ed25519",
        true,
        ["sign", "verify"],
    ) as CryptoKeyPair;
    const jwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
    if (!jwk.x) throw new Error("Ed25519 key has no public key");
    const payload: ReceiptPayload = {
        v: 1,
        alg: "Ed25519",
        hash: "sha256",
        runId: "run_test",
        endpoint: "exa#search",
        docHash: `sha256:${"ab".repeat(32)}`,
        upstream: "https://api.exa.ai/search",
        inputHash: await hashReceiptInput(INPUT),
        outputHash: await hashReceiptOutput(HOSTED),
        charged: "$0.005000",
        at: "2026-11-23T00:00:00.000Z",
        keyId: "ed25519-test",
        ...extra,
    };
    const receipt: SignedReceipt = {
        alg: "Ed25519",
        payload,
        signature: await signCanonical(pair.privateKey, payload),
    };
    return {
        receipt,
        keys: [{ id: "ed25519-test", publicKey: jwk.x }],
        endpoint: {
            id: payload.endpoint,
            docHash: payload.docHash,
            upstream: payload.upstream,
            outputSchema: SCHEMA,
        },
    };
}

function line(
    report: { lines: { name: string; state: string; detail: string }[] },
    name: string,
) {
    const found = report.lines.find((item) => item.name === name);
    if (!found) throw new Error(`missing line ${name}`);
    return found;
}

Deno.test("a non-bit-stable replay compares status, schema, and a diff", async () => {
    const { receipt, keys, endpoint } = await minted();
    let called = false;
    const report = await verifyHostedCall({
        receipt,
        keys,
        endpoint,
        input: INPUT,
        hostedOutput: HOSTED,
        hostedStatus: 200,
        validateOutput: validateAgainst,
        replay: () => {
            called = true;
            return Promise.resolve({
                httpStatus: 200,
                output: { title: "b" },
                isProviderError: false,
            });
        },
    });
    assert(called);
    assertEquals(report.exitCode, 0);
    assertEquals(report.bitStable, false);
    assertEquals(line(report, "signature").state, "ok");
    assertEquals(line(report, "endpoint").state, "ok");
    assertEquals(line(report, "docHash").state, "ok");
    assertEquals(line(report, "upstream").state, "ok");
    assertEquals(line(report, "inputHash").state, "ok");
    assertEquals(line(report, "hostedOutput").state, "ok");
    assertEquals(line(report, "status").state, "ok");
    assertEquals(line(report, "schema").state, "ok");
    assertEquals(line(report, "outputHash").state, "skip");
    assertStringIncludes(
        line(report, "outputHash").detail,
        "provider response is not bit-stable",
    );
    assertEquals(line(report, "diff").state, "differs");
    const text = formatReport(report);
    assertStringIncludes(text, "$.title changed");
    assert(!text.includes("sekret"));
    assert(!text.includes("conclusive:"));
});

Deno.test("status and schema differences are reported and are not a hash proof", async () => {
    const { receipt, keys, endpoint } = await minted();
    const report = await verifyHostedCall({
        receipt,
        keys,
        endpoint,
        input: INPUT,
        hostedOutput: HOSTED,
        hostedStatus: 200,
        validateOutput: validateAgainst,
        replay: {
            httpStatus: 500,
            output: { title: 1 },
            isProviderError: true,
        },
    });
    assertEquals(report.exitCode, 0);
    assertEquals(line(report, "status").state, "differs");
    assertStringIncludes(line(report, "status").detail, "hosted HTTP 200");
    assertEquals(line(report, "schema").state, "differs");
    assertEquals(line(report, "outputHash").state, "skip");
    assertStringIncludes(
        line(report, "outputHash").detail,
        "not bit-stable",
    );
});

Deno.test("a bit-stable endpoint makes outputHash conclusive", async () => {
    const { receipt, keys, endpoint } = await minted();
    const mismatch = await verifyHostedCall({
        receipt,
        keys,
        endpoint,
        input: INPUT,
        hostedOutput: HOSTED,
        deterministic: true,
        replay: {
            httpStatus: 200,
            output: { title: "b" },
            isProviderError: false,
        },
    });
    assertEquals(mismatch.exitCode, 1);
    assertEquals(mismatch.bitStable, true);
    assertEquals(line(mismatch, "outputHash").state, "fail");
    assertStringIncludes(line(mismatch, "outputHash").detail, "conclusive");
    assert(
        !line(mismatch, "outputHash").detail.includes("not bit-stable"),
    );

    const match = await verifyHostedCall({
        receipt,
        keys,
        endpoint,
        input: INPUT,
        deterministicEndpoints: new Set(["exa#search"]),
        replay: {
            httpStatus: 200,
            output: { title: "a" },
            isProviderError: false,
        },
    });
    assertEquals(match.exitCode, 0);
    assertEquals(match.bitStable, true);
    assertEquals(line(match, "outputHash").state, "ok");
    assertStringIncludes(line(match, "outputHash").detail, "conclusive");
    assertEquals(line(match, "schema").state, "skip");
});

Deno.test("catalog, input, and hosted-output mismatches fail closed", async () => {
    const base = await minted();
    let calls = 0;
    const replay = () => {
        calls++;
        return Promise.resolve({
            httpStatus: 200,
            output: { title: "a" },
            isProviderError: false,
        });
    };

    const docHash = await verifyHostedCall({
        ...base,
        endpoint: {
            ...base.endpoint,
            docHash: `sha256:${"ff".repeat(32)}`,
        },
        input: INPUT,
        replay,
    });
    assertEquals(docHash.exitCode, 1);
    assertEquals(line(docHash, "docHash").state, "fail");
    assertEquals(line(docHash, "replay").state, "skip");

    const missing = await verifyHostedCall({
        ...base,
        endpoint: null,
        input: INPUT,
        replay,
    });
    assertEquals(missing.exitCode, 1);
    assertEquals(line(missing, "endpoint").state, "fail");
    assertStringIncludes(
        line(missing, "endpoint").detail,
        "not in the local catalog",
    );

    const upstream = await verifyHostedCall({
        ...base,
        endpoint: {
            ...base.endpoint,
            upstream: "https://api.exa.ai/other",
        },
        input: INPUT,
        replay,
    });
    assertEquals(upstream.exitCode, 1);
    assertEquals(line(upstream, "upstream").state, "fail");

    const input = await verifyHostedCall({
        ...base,
        input: { body: { query: "other" } },
        replay,
    });
    assertEquals(input.exitCode, 1);
    assertEquals(line(input, "inputHash").state, "fail");

    const hosted = await verifyHostedCall({
        ...base,
        input: INPUT,
        hostedOutput: { title: "other" },
        replay,
    });
    assertEquals(hosted.exitCode, 1);
    assertEquals(line(hosted, "hostedOutput").state, "fail");
    assertEquals(calls, 0);
});

Deno.test("a bad signature and a partial log do not replay", async () => {
    const base = await minted();
    const tampered = structuredClone(base.receipt);
    tampered.payload.runId = "run_other";
    let calls = 0;
    const bad = await verifyHostedCall({
        receipt: tampered,
        keys: base.keys,
        endpoint: base.endpoint,
        input: INPUT,
        replay: () => {
            calls++;
            return Promise.resolve({
                httpStatus: 200,
                output: { title: "a" },
                isProviderError: false,
            });
        },
    });
    assertEquals(bad.exitCode, 1);
    assertEquals(line(bad, "signature").state, "fail");
    assertEquals(line(bad, "replay").state, "skip");

    const partial = structuredClone(base.receipt);
    partial.payload.logSeq = 4;
    const log = await verifyHostedCall({
        receipt: partial,
        keys: base.keys,
        endpoint: base.endpoint,
        replay: () => {
            calls++;
            return Promise.resolve({
                httpStatus: 200,
                output: null,
                isProviderError: false,
            });
        },
    });
    assertEquals(log.exitCode, 1);
    assertStringIncludes(
        line(log, "signature").detail,
        "log citation is incomplete",
    );
    assertEquals(calls, 0);
});

Deno.test("replay is skipped unless asked, and a thrown replay fails", async () => {
    const base = await minted();
    const skipped = await verifyHostedCall({
        ...base,
        input: INPUT,
        replay: false,
    });
    assertEquals(skipped.exitCode, 0);
    assertEquals(line(skipped, "replay").detail, "not requested");
    assertEquals(line(skipped, "inputHash").state, "ok");

    const thrown = await verifyHostedCall({
        ...base,
        input: INPUT,
        replay: () =>
            Promise.reject(new Error("MISSING_CREDENTIAL EXA_API_KEY")),
    });
    assertEquals(thrown.exitCode, 1);
    assertStringIncludes(line(thrown, "replay").detail, "MISSING_CREDENTIAL");

    const needsInput = await verifyHostedCall({
        ...base,
        replay: {
            httpStatus: 200,
            output: { title: "a" },
            isProviderError: false,
        },
    });
    assertEquals(needsInput.exitCode, 1);
    assertStringIncludes(line(needsInput, "replay").detail, "--input");
});

Deno.test("diffJson reports nested changes and ignores key order", () => {
    const same = diffJson(
        { b: 1, a: { z: true } },
        { a: { z: true }, b: 1 },
    );
    assertEquals(same.entries, []);
    const changed = diffJson(
        { items: [{ id: "a" }], extra: 1 },
        { items: [{ id: "b" }, { id: "c" }] },
    );
    assertEquals(changed.entries.map((entry) => entry.path), [
        "$.extra",
        "$.items[0].id",
        "$.items[1]",
    ]);
    assertEquals(changed.entries[0].kind, "removed");
    assertEquals(changed.entries[2].kind, "added");
});
