/**
 * Verify a hosted Agent Flow receipt. Ed25519 over RFC 8785 canonical
 * JSON, checked with the public keys from GET /keys. This module has no
 * wallet, no gateway, and no private signing key.
 *
 * The signed bytes are the canonical form of `payload`. inputHash and
 * outputHash are SHA-256 hex of the canonical JSON of the scrubbed run
 * input and the stored output. Credential-shaped object keys are removed
 * before hashing. A missing output hashes as null.
 *
 * When a transparency log has entries, the payload also names that head
 * (`logSeq`, `logHash`). An empty log, and receipts signed before the
 * log existed, omit both. Verification accepts either shape and rejects
 * a partial citation.
 */
import { sha256Hex, stableStringify } from "@shared/core";
import type { Json } from "@shared/core";

export const RECEIPT_ALG = "Ed25519";

/** Default public-key endpoint. No Agent Flow API key. */
export const DEFAULT_KEYS_URL = "https://letagentflow.com/keys";

export interface VerifyKey {
    id: string;
    /** Base64url of the raw 32-byte Ed25519 public key. */
    publicKey: string;
}

/** What a signature covers. Field names are part of the signed bytes. */
export interface ReceiptPayload {
    v: 1;
    alg: "Ed25519";
    hash: "sha256";
    runId: string;
    endpoint: string;
    /** Compiled endpoint doc.hash. */
    docHash: string;
    /** Upstream request URL template, with no credential query or userinfo. */
    upstream: string;
    inputHash: string;
    outputHash: string;
    /** Charged USD, the same text the gateway prints (`$0.005000`). */
    charged: string;
    /** UTC timestamp, `YYYY-MM-DDTHH:MM:SS.sssZ`. */
    at: string;
    keyId: string;
    /** Transparency-log head at settle time. Both present, or both absent. */
    logSeq?: number;
    /** SHA-256 hex of that log entry. An empty log omits this. */
    logHash?: string;
}

export interface SignedReceipt {
    alg: "Ed25519";
    payload: ReceiptPayload;
    /** Base64url of the Ed25519 signature over canonicalJson(payload). */
    signature: string;
}

export type VerifyResult =
    | { valid: true; keyId: string }
    | { valid: false; reason: string };

/** Names that carry a credential. Matched on object keys only, so a
 *  job id or a token budget is left alone. The gateway uses this list. */
const SECRET_KEY =
    /^(authorization|proxy-authorization|api[-_]?key|x-api-key|access[-_]?token|refresh[-_]?token|id[-_]?token|secret|client[-_]?secret|password|passwd|credential|credentials|cookie|set-cookie)$/i;

export function canonicalJson(value: unknown): string {
    try {
        return stableStringify(value as Json);
    } catch (error) {
        throw new Error(
            `value cannot be canonical JSON: ${(error as Error).message}`,
        );
    }
}

function bytes(view: Uint8Array): Uint8Array<ArrayBuffer> {
    const copy = new Uint8Array(view.byteLength);
    copy.set(view);
    return copy;
}

function base64UrlEncode(raw: Uint8Array): string {
    let s = "";
    for (const b of raw) s += String.fromCharCode(b);
    return btoa(s).replaceAll("+", "-").replaceAll("/", "_").replace(
        /=+$/,
        "",
    );
}

function base64UrlDecode(text: string): Uint8Array {
    const normalized = text.replaceAll("-", "+").replaceAll("_", "/");
    const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
    const bin = atob(padded);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
}

/** Drop credential-shaped keys anywhere in a JSON value. */
export function stripSecrets(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(stripSecrets);
    if (!value || typeof value !== "object") return value;
    const out: Record<string, unknown> = {};
    for (const [key, inner] of Object.entries(value)) {
        if (SECRET_KEY.test(key)) continue;
        out[key] = stripSecrets(inner);
    }
    return out;
}

/** The request material that is hashed: the caller's body, query and
 *  path, never headers and never a credential field. */
export function receiptInput(input: unknown): unknown {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        return null;
    }
    const src = input as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of ["body", "queryParams", "pathParams"]) {
        if (key in src) out[key] = stripSecrets(src[key]);
    }
    return out;
}

/** The output material that is hashed. A missing output is null. */
export function receiptOutput(output: unknown): unknown {
    return output === undefined ? null : stripSecrets(output);
}

/** URL template safe to publish: no userinfo, no credential query.
 *  A template with nothing to strip is returned unchanged, so path
 *  placeholders such as `{id}` stay as placeholders. */
export function publicUpstream(url: string): string {
    try {
        const parsed = new URL(url);
        const hadUser = parsed.username !== "" || parsed.password !== "";
        if (hadUser) {
            parsed.username = "";
            parsed.password = "";
        }
        let stripped = false;
        for (const key of [...parsed.searchParams.keys()]) {
            if (SECRET_KEY.test(key)) {
                parsed.searchParams.delete(key);
                stripped = true;
            }
        }
        if (!hadUser && !stripped) return url;
        return parsed.toString()
            .replaceAll("%7B", "{").replaceAll("%7b", "{")
            .replaceAll("%7D", "}").replaceAll("%7d", "}");
    } catch {
        return url.replace(
            /([?&])(api[_-]?key|access[_-]?token|secret|password)=[^&]*/gi,
            "$1$2=redacted",
        );
    }
}

export async function hashReceiptInput(input: unknown): Promise<string> {
    return await sha256Hex(canonicalJson(receiptInput(input)));
}

export async function hashReceiptOutput(output: unknown): Promise<string> {
    return await sha256Hex(canonicalJson(receiptOutput(output)));
}

/** Recompute the hashes a receipt claims. The signature check does not
 *  need the original input or output. */
export async function hashesMatch(
    payload: Pick<ReceiptPayload, "inputHash" | "outputHash">,
    input: unknown,
    output: unknown,
): Promise<boolean> {
    const inputHash = await hashReceiptInput(input);
    const outputHash = await hashReceiptOutput(output);
    return payload.inputHash === inputHash && payload.outputHash === outputHash;
}

function payloadError(value: unknown): string | undefined {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return "receipt payload is missing";
    }
    const p = value as Partial<ReceiptPayload>;
    if (p.v !== 1) return "unsupported receipt version";
    if (p.alg !== RECEIPT_ALG || p.hash !== "sha256") {
        return "unsupported receipt algorithm";
    }
    for (
        const key of [
            "runId",
            "endpoint",
            "docHash",
            "upstream",
            "inputHash",
            "outputHash",
            "charged",
            "at",
            "keyId",
        ] as const
    ) {
        if (typeof p[key] !== "string" || p[key] === "") {
            return `receipt payload.${key} is missing`;
        }
    }
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(p.at!)) {
        return "receipt payload.at is not a UTC timestamp";
    }
    if (!/^\$\d+\.\d{6}$/.test(p.charged!)) {
        return "receipt payload.charged is not a USD amount";
    }
    if (
        !/^[0-9a-f]{64}$/.test(p.inputHash!) ||
        !/^[0-9a-f]{64}$/.test(p.outputHash!)
    ) {
        return "receipt payload hash is not sha256 hex";
    }
    const cited = p as ReceiptPayload;
    const hasSeq = cited.logSeq !== undefined;
    const hasLogHash = cited.logHash !== undefined;
    if (hasSeq !== hasLogHash) {
        return "receipt payload log citation is incomplete";
    }
    if (hasSeq) {
        if (!Number.isSafeInteger(cited.logSeq) || cited.logSeq! < 1) {
            return "receipt payload.logSeq is not a sequence number";
        }
        if (!/^[0-9a-f]{64}$/.test(cited.logHash!)) {
            return "receipt payload.logHash is not sha256 hex";
        }
    }
    return undefined;
}

export function parseSignedReceipt(
    receipt: unknown,
): { ok: true; receipt: SignedReceipt } | { ok: false; reason: string } {
    if (!receipt || typeof receipt !== "object" || Array.isArray(receipt)) {
        return { ok: false, reason: "receipt is not an object" };
    }
    const signed = receipt as Partial<SignedReceipt>;
    if (signed.alg !== RECEIPT_ALG) {
        return { ok: false, reason: "unsupported receipt algorithm" };
    }
    const problem = payloadError(signed.payload);
    if (problem) return { ok: false, reason: problem };
    if (typeof signed.signature !== "string" || !signed.signature) {
        return { ok: false, reason: "receipt signature is missing" };
    }
    return { ok: true, receipt: signed as SignedReceipt };
}

/** Ed25519 signature, base64url, over the canonical JSON of `value`.
 *  Tests mint receipts with a key they generated. The gateway's private
 *  key is not loaded here. */
export async function signCanonical(
    privateKey: CryptoKey,
    value: unknown,
): Promise<string> {
    const signature = new Uint8Array(
        await crypto.subtle.sign(
            RECEIPT_ALG,
            privateKey,
            new TextEncoder().encode(canonicalJson(value)),
        ),
    );
    return base64UrlEncode(signature);
}

/** Check a receipt against the listed public keys. Pure: no network. */
export async function verifyReceipt(
    receipt: unknown,
    keys: readonly VerifyKey[],
): Promise<VerifyResult> {
    const parsed = parseSignedReceipt(receipt);
    if (!parsed.ok) return { valid: false, reason: parsed.reason };
    const { payload, signature: signatureText } = parsed.receipt;
    const key = keys.find((k) => k.id === payload.keyId);
    if (!key) {
        return {
            valid: false,
            reason: `unknown signing key ${payload.keyId}`,
        };
    }
    let publicKey: CryptoKey;
    let signature: Uint8Array;
    try {
        const raw = base64UrlDecode(key.publicKey);
        if (raw.length !== 32) {
            return {
                valid: false,
                reason: `signing key ${key.id} is not 32 bytes`,
            };
        }
        publicKey = await crypto.subtle.importKey(
            "raw",
            bytes(raw),
            RECEIPT_ALG,
            true,
            ["verify"],
        );
        signature = base64UrlDecode(signatureText);
    } catch {
        return {
            valid: false,
            reason: "receipt signature or key is malformed",
        };
    }
    const ok = await crypto.subtle.verify(
        RECEIPT_ALG,
        publicKey,
        bytes(signature),
        new TextEncoder().encode(canonicalJson(payload)),
    );
    return ok
        ? { valid: true, keyId: key.id }
        : { valid: false, reason: "signature does not match the payload" };
}

/** GET /keys returns `{ keys: [...] }` (and an `alg` field). A bare
 *  array is accepted too, so an offline file can be either shape. */
export function parseVerifyKeys(value: unknown): VerifyKey[] {
    const list = Array.isArray(value)
        ? value
        : value && typeof value === "object" &&
                Array.isArray((value as { keys?: unknown }).keys)
        ? (value as { keys: unknown[] }).keys
        : undefined;
    if (!list) {
        throw new Error(
            "keys must be a JSON array or an object with a keys array",
        );
    }
    if (list.length === 0) throw new Error("keys list is empty");
    return list.map((item, i) => {
        const key = item as Partial<VerifyKey>;
        if (!key || typeof key.id !== "string" || key.id === "") {
            throw new Error(`keys[${i}].id is missing`);
        }
        if (typeof key.publicKey !== "string" || key.publicKey === "") {
            throw new Error(`keys[${i}].publicKey is missing`);
        }
        return { id: key.id, publicKey: key.publicKey };
    });
}

export async function fetchVerifyKeys(
    url: string,
    fetchImpl: typeof fetch = fetch,
): Promise<VerifyKey[]> {
    const res = await fetchImpl(url);
    if (!res.ok) {
        throw new Error(`GET ${url} returned HTTP ${res.status}`);
    }
    return parseVerifyKeys(await res.json());
}
