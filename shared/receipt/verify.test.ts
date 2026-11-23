import { assert, assertEquals, assertRejects, assertThrows } from "@std/assert";
import {
    canonicalJson,
    fetchVerifyKeys,
    hashesMatch,
    hashReceiptInput,
    hashReceiptOutput,
    parseSignedReceipt,
    parseVerifyKeys,
    publicUpstream,
    readJsonInput,
    receiptInput,
    type ReceiptPayload,
    signCanonical,
    type SignedReceipt,
    stdinConflict,
    verifyReceipt,
} from "./mod.ts";

const INPUT = {
    body: { query: "batteries", apiKey: "sekret" },
    headers: { authorization: "Bearer sekret" },
    queryParams: { n: 1 },
};
const OUTPUT = { results: [{ title: "a" }], access_token: "sekret" };

function fixtureDir(): URL {
    return new URL("./fixtures/", import.meta.url);
}

async function readFixture(name: string): Promise<unknown> {
    return JSON.parse(
        await Deno.readTextFile(new URL(name, fixtureDir())),
    );
}

Deno.test("public upstream drops credentials and keeps placeholders", () => {
    assertEquals(
        publicUpstream("https://api.exa.ai/search?api_key=sekret"),
        "https://api.exa.ai/search",
    );
    assertEquals(
        publicUpstream(
            "https://user:secret@example.com/v1/{id}?api_key=sk_live&q={q}",
        ),
        "https://example.com/v1/{id}?q={q}",
    );
    assertEquals(
        publicUpstream("https://api.example.com/v1/sessions/{sessionId}"),
        "https://api.example.com/v1/sessions/{sessionId}",
    );
    assert(
        !publicUpstream(
            "https://user:secret@example.com/v1/{id}?api_key=sk_live",
        ).includes("secret"),
    );
});

Deno.test("hashes drop credential keys, headers, and a missing output", async () => {
    assertEquals(receiptInput(INPUT), {
        body: { query: "batteries" },
        queryParams: { n: 1 },
    });
    const scrubbed = {
        body: { query: "batteries" },
        queryParams: { n: 1 },
    };
    assertEquals(
        await hashReceiptInput(INPUT),
        await hashReceiptInput(scrubbed),
    );
    assertEquals(
        await hashReceiptInput({ ...INPUT, headers: { cookie: "other" } }),
        await hashReceiptInput(scrubbed),
    );
    assertEquals(
        await hashReceiptOutput(OUTPUT),
        await hashReceiptOutput({ results: [{ title: "a" }] }),
    );
    assertEquals(
        await hashReceiptOutput(undefined),
        await hashReceiptOutput(null),
    );
    const nested = {
        body: {
            job: "keep-token-budget",
            tokenBudget: 3,
            auth: { password: "sekret", name: "ada" },
        },
    };
    assertEquals(receiptInput(nested), {
        body: {
            job: "keep-token-budget",
            tokenBudget: 3,
            auth: { name: "ada" },
        },
    });
});

async function testKey(): Promise<{
    privateKey: CryptoKey;
    keys: { id: string; publicKey: string }[];
}> {
    const pair = await crypto.subtle.generateKey(
        "Ed25519",
        true,
        ["sign", "verify"],
    ) as CryptoKeyPair;
    const jwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
    if (!jwk.x) throw new Error("Ed25519 key has no public key");
    return {
        privateKey: pair.privateKey,
        keys: [{ id: "ed25519-test", publicKey: jwk.x }],
    };
}

async function payloadOf(
    keyId: string,
    extra: Partial<ReceiptPayload> = {},
): Promise<ReceiptPayload> {
    return {
        v: 1,
        alg: "Ed25519",
        hash: "sha256",
        runId: "run_test",
        endpoint: "exa#search",
        docHash: `sha256:${"ab".repeat(32)}`,
        upstream: "https://api.exa.ai/search",
        inputHash: await hashReceiptInput(INPUT),
        outputHash: await hashReceiptOutput(OUTPUT),
        charged: "$0.005000",
        at: "2026-11-23T00:00:00.000Z",
        keyId,
        ...extra,
    };
}

async function mint(
    privateKey: CryptoKey,
    payload: ReceiptPayload,
): Promise<SignedReceipt> {
    return {
        alg: "Ed25519",
        payload,
        signature: await signCanonical(privateKey, payload),
    };
}

Deno.test("a receipt verifies with and without a log citation", async () => {
    const { privateKey, keys } = await testKey();
    const plain = await mint(privateKey, await payloadOf(keys[0].id));
    assertEquals(await verifyReceipt(plain, keys), {
        valid: true,
        keyId: "ed25519-test",
    });
    assert(
        await hashesMatch(plain.payload, INPUT, OUTPUT),
    );
    assert(!JSON.stringify(plain).includes("sekret"));

    const cited = await payloadOf(keys[0].id, {
        logSeq: 2,
        logHash: "cd".repeat(32),
    });
    const signed = await mint(privateKey, cited);
    assertEquals(await verifyReceipt(signed, keys), {
        valid: true,
        keyId: "ed25519-test",
    });
});

Deno.test("verification ignores payload key order", async () => {
    const { privateKey, keys } = await testKey();
    const payload = await payloadOf(keys[0].id);
    const signed = await mint(privateKey, payload);
    const reversed = {
        keyId: payload.keyId,
        at: payload.at,
        charged: payload.charged,
        outputHash: payload.outputHash,
        inputHash: payload.inputHash,
        upstream: payload.upstream,
        docHash: payload.docHash,
        endpoint: payload.endpoint,
        runId: payload.runId,
        hash: payload.hash,
        alg: payload.alg,
        v: payload.v,
    };
    assertEquals(canonicalJson(reversed), canonicalJson(payload));
    assertEquals(
        await verifyReceipt({ ...signed, payload: reversed }, keys),
        { valid: true, keyId: "ed25519-test" },
    );
});

Deno.test("tampered payloads and bad signatures do not verify", async () => {
    const { privateKey, keys } = await testKey();
    const signed = await mint(privateKey, await payloadOf(keys[0].id));
    const fields = [
        "runId",
        "endpoint",
        "docHash",
        "upstream",
        "inputHash",
        "outputHash",
        "charged",
        "at",
        "keyId",
    ] as const;
    for (const field of fields) {
        const tampered = structuredClone(signed);
        const payload = tampered.payload as unknown as Record<string, string>;
        payload[field] = field === "charged"
            ? "$9.000000"
            : field === "at"
            ? "2026-11-23T00:00:01.000Z"
            : field.endsWith("Hash")
            ? "f".repeat(64)
            : `${payload[field]}-tampered`;
        assertEquals(
            (await verifyReceipt(tampered, keys)).valid,
            false,
            field,
        );
    }
    const badSig = structuredClone(signed);
    // The final base64 character can carry unused bits, so flip the first.
    const flipped = badSig.signature[0] === "A" ? "B" : "A";
    badSig.signature = flipped + badSig.signature.slice(1);
    assertEquals((await verifyReceipt(badSig, keys)).valid, false);
    assertEquals(
        await verifyReceipt(signed, [{
            id: "someone-else",
            publicKey: keys[0].publicKey,
        }]),
        {
            valid: false,
            reason: "unknown signing key ed25519-test",
        },
    );
    const short = base64Url(new Uint8Array(16));
    assertEquals(
        await verifyReceipt(signed, [{
            id: "ed25519-test",
            publicKey: short,
        }]),
        {
            valid: false,
            reason: "signing key ed25519-test is not 32 bytes",
        },
    );
});

Deno.test("partial and malformed log citations are rejected", async () => {
    const { privateKey, keys } = await testKey();
    const signed = await mint(privateKey, await payloadOf(keys[0].id));
    const cases: Array<{ patch: Record<string, unknown>; reason: string }> = [
        {
            patch: { logSeq: 1 },
            reason: "receipt payload log citation is incomplete",
        },
        {
            patch: { logHash: "ab".repeat(32) },
            reason: "receipt payload log citation is incomplete",
        },
        {
            patch: { logSeq: 0, logHash: "ab".repeat(32) },
            reason: "receipt payload.logSeq is not a sequence number",
        },
        {
            patch: { logSeq: 1.5, logHash: "ab".repeat(32) },
            reason: "receipt payload.logSeq is not a sequence number",
        },
        {
            patch: { logSeq: 1, logHash: "abcd" },
            reason: "receipt payload.logHash is not sha256 hex",
        },
    ];
    for (const { patch, reason } of cases) {
        const tampered = structuredClone(signed);
        Object.assign(tampered.payload, patch);
        assertEquals(await verifyReceipt(tampered, keys), {
            valid: false,
            reason,
        });
    }
    assertEquals(
        parseSignedReceipt({ alg: "Ed25519" }),
        { ok: false, reason: "receipt payload is missing" },
    );
    const missing = await verifyReceipt(null, keys);
    assertEquals(missing.valid, false);
    if (!missing.valid) {
        assertEquals(missing.reason, "receipt is not an object");
    }
});

Deno.test("offline key fixture verifies both receipt shapes", async () => {
    const keys = parseVerifyKeys(await readFixture("keys.json"));
    const plain = await readFixture("receipt.json");
    const cited = await readFixture("receipt-log.json");
    assertEquals(await verifyReceipt(plain, keys), {
        valid: true,
        keyId: "ed25519-fixture",
    });
    assertEquals(await verifyReceipt(cited, keys), {
        valid: true,
        keyId: "ed25519-fixture",
    });
    const input = await readFixture("input.json");
    const output = await readFixture("output.json");
    const payload = (plain as SignedReceipt).payload;
    assertEquals(payload.inputHash, await hashReceiptInput(input));
    assertEquals(payload.outputHash, await hashReceiptOutput(output));
    assert(JSON.stringify(input).includes("sekret"));
    assert(!JSON.stringify(plain).includes("sekret"));
    assert(!JSON.stringify(cited).includes("sekret"));
    const tampered = structuredClone(plain) as SignedReceipt;
    tampered.payload.runId = `${tampered.payload.runId}-tampered`;
    assertEquals(await verifyReceipt(tampered, keys), {
        valid: false,
        reason: "signature does not match the payload",
    });
});

Deno.test("parseVerifyKeys accepts the endpoint object and a bare array", () => {
    const key = { id: "ed25519-fixture", publicKey: "abc" };
    assertEquals(
        parseVerifyKeys({ alg: "Ed25519", keys: [key] }),
        [key],
    );
    assertEquals(parseVerifyKeys([key]), [key]);
    assertThrows(
        () => parseVerifyKeys({ alg: "Ed25519" }),
        Error,
        "keys array",
    );
    assertThrows(() => parseVerifyKeys({ keys: [] }), Error, "empty");
});

Deno.test("fetchVerifyKeys reads JSON and surfaces HTTP failures", async () => {
    const keys = await fetchVerifyKeys(
        "https://keys.example/keys",
        (() =>
            Promise.resolve(Response.json({
                alg: "Ed25519",
                keys: [{ id: "k", publicKey: "abc" }],
            }))) as typeof fetch,
    );
    assertEquals(keys, [{ id: "k", publicKey: "abc" }]);
    await assertRejects(
        () =>
            fetchVerifyKeys(
                "https://keys.example/keys",
                (() =>
                    Promise.resolve(
                        new Response("no", { status: 500 }),
                    )) as typeof fetch,
            ),
        Error,
        "HTTP 500",
    );
});

Deno.test("readJsonInput accepts a file, inline JSON, and stdin", async () => {
    const dir = await Deno.makeTempDir();
    const path = `${dir}/input.json`;
    await Deno.writeTextFile(path, '{"body":{"query":"q"}}\n');
    assertEquals(
        await readJsonInput(path, "receipt", {
            readText: (file) => Deno.readTextFile(file),
        }),
        { body: { query: "q" } },
    );
    assertEquals(
        await readJsonInput('{"body":{"n":1}}', "--input", { inline: true }),
        { body: { n: 1 } },
    );
    assertEquals(
        await readJsonInput("-", "receipt", {
            readStdin: () => Promise.resolve("[1]"),
        }),
        [1],
    );
    assert(stdinConflict(["-", "-", undefined]));
    assert(!stdinConflict(["receipt.json", "-"]));
    await assertRejects(
        () =>
            readJsonInput("missing.json", "receipt", {
                readText: () => Promise.reject(new Error("not found")),
            }),
        Error,
        "cannot read",
    );
});

function base64Url(raw: Uint8Array): string {
    let s = "";
    for (const b of raw) s += String.fromCharCode(b);
    return btoa(s).replaceAll("+", "-").replaceAll("/", "_").replace(
        /=+$/,
        "",
    );
}
