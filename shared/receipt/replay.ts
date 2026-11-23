/**
 * Compare a signed receipt with this checkout and with a local replay.
 *
 * outputHash equality is conclusive only for an endpoint documented as
 * bit-stable (`DETERMINISTIC_ENDPOINTS`) or when the caller asserts
 * `--deterministic`. Every other provider response is compared by HTTP
 * status, the endpoint output schema, and a structured diff. A matching
 * or differing hash is reported, and it is not treated as proof.
 */
import type { Json } from "@shared/core";
import {
    canonicalJson,
    hashReceiptInput,
    hashReceiptOutput,
    parseSignedReceipt,
    receiptOutput,
    type ReceiptPayload,
    type VerifyKey,
    verifyReceipt,
} from "./verify.ts";

type OutputValidator = (
    schema: Record<string, Json>,
    data: unknown,
) => { ok: true } | { ok: false; message: string };

/** Endpoint ids whose provider response is documented as bit-stable.
 *  None are marked: a replay does not treat outputHash as proof unless
 *  the caller passes `--deterministic`. */
export const DETERMINISTIC_ENDPOINTS: ReadonlySet<string> = new Set();

export function isBitStable(
    endpointId: string,
    asserted = false,
    marked: ReadonlySet<string> = DETERMINISTIC_ENDPOINTS,
): boolean {
    return asserted || marked.has(endpointId);
}

export interface CatalogEndpoint {
    id: string;
    /** Compiled `doc.hash` (`sha256:<hex>`). */
    docHash: string;
    /** `publicUpstream` of the compiled request URL template. */
    upstream: string;
    outputSchema?: Record<string, Json>;
}

export interface ReplayResult {
    httpStatus: number;
    output: unknown;
    isProviderError: boolean;
}

export interface ReportLine {
    name: string;
    state: "ok" | "fail" | "differs" | "skip";
    detail: string;
    notes?: string[];
}

export interface JsonDiff {
    path: string;
    kind: "added" | "removed" | "changed";
    hosted?: unknown;
    local?: unknown;
}

export interface VerificationReport {
    exitCode: number;
    header?: string;
    lines: ReportLine[];
    /** True when outputHash equality was treated as proof. */
    bitStable: boolean;
}

const DIFF_LIMIT = 40;

export function formatReport(report: VerificationReport): string {
    const lines: string[] = [];
    if (report.header) lines.push(report.header);
    for (const line of report.lines) {
        lines.push(`${line.name}: ${line.state} — ${line.detail}`);
        for (const note of line.notes ?? []) lines.push(`  ${note}`);
    }
    return lines.join("\n");
}

export function diffJson(hosted: unknown, local: unknown): {
    entries: JsonDiff[];
    truncated: number;
} {
    const entries: JsonDiff[] = [];
    let truncated = 0;
    const push = (entry: JsonDiff) => {
        if (entries.length >= DIFF_LIMIT) truncated++;
        else entries.push(entry);
    };
    const walk = (h: unknown, l: unknown, path: string) => {
        if (sameJson(h, l)) return;
        if (isObject(h) && isObject(l)) {
            const keys = [...new Set([...Object.keys(h), ...Object.keys(l)])]
                .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
            for (const key of keys) {
                const child = `${path}.${key}`;
                const inH = Object.hasOwn(h, key);
                const inL = Object.hasOwn(l, key);
                if (inH && inL) walk(h[key], l[key], child);
                else if (inH) {
                    push({ path: child, kind: "removed", hosted: h[key] });
                } else push({ path: child, kind: "added", local: l[key] });
            }
            return;
        }
        if (Array.isArray(h) && Array.isArray(l)) {
            const n = Math.max(h.length, l.length);
            for (let i = 0; i < n; i++) {
                const child = `${path}[${i}]`;
                if (i >= h.length) {
                    push({ path: child, kind: "added", local: l[i] });
                } else if (i >= l.length) {
                    push({ path: child, kind: "removed", hosted: h[i] });
                } else walk(h[i], l[i], child);
            }
            return;
        }
        push({ path, kind: "changed", hosted: h, local: l });
    };
    walk(hosted, local, "$");
    return { entries, truncated };
}

function isObject(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === "object" && !Array.isArray(value);
}

function sameJson(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) return true;
    try {
        return canonicalJson(a) === canonicalJson(b);
    } catch {
        return false;
    }
}

function preview(value: unknown): string {
    let text: string;
    try {
        text = canonicalJson(value);
    } catch {
        text = String(value);
    }
    return text.length > 120 ? `${text.slice(0, 117)}...` : text;
}

function diffNote(entry: JsonDiff): string {
    if (entry.kind === "added") {
        return `${entry.path} added local ${preview(entry.local)}`;
    }
    if (entry.kind === "removed") {
        return `${entry.path} removed hosted ${preview(entry.hosted)}`;
    }
    return `${entry.path} changed hosted ${preview(entry.hosted)} local ${
        preview(entry.local)
    }`;
}

export async function verifyHostedCall(args: {
    receipt: unknown;
    keys: readonly VerifyKey[];
    /** Local compiled endpoint. `null` means the id is not in the catalog.
     *  Omit to skip catalog checks. */
    endpoint?: CatalogEndpoint | null;
    input?: unknown;
    /** Stored hosted output (the value that was hashed), for the signed
     *  outputHash and for the diff. Not the whole run record. */
    hostedOutput?: unknown;
    hostedStatus?: number;
    /** `false` or omitted: do not replay. A result is a finished replay.
     *  A function is called only after the gating checks pass. */
    replay?: false | ReplayResult | (() => Promise<ReplayResult>);
    /** Assert bit-stability for this call (`--deterministic`). */
    deterministic?: boolean;
    deterministicEndpoints?: ReadonlySet<string>;
    validateOutput?: OutputValidator;
}): Promise<VerificationReport> {
    const parsed = parseSignedReceipt(args.receipt);
    if (!parsed.ok) {
        return {
            exitCode: 1,
            bitStable: false,
            lines: [{
                name: "signature",
                state: "fail",
                detail: parsed.reason,
            }],
        };
    }
    const signed = parsed.receipt;
    const payload = signed.payload;
    const lines: ReportLine[] = [];
    const signature = await verifyReceipt(signed, args.keys);
    lines.push({
        name: "signature",
        state: signature.valid ? "ok" : "fail",
        detail: signature.valid ? `keyId ${signature.keyId}` : signature.reason,
    });
    lines.push(
        payload.logSeq === undefined
            ? {
                name: "log",
                state: "ok",
                detail: "no logSeq or logHash on the receipt",
            }
            : {
                name: "log",
                state: "ok",
                detail:
                    `seq ${payload.logSeq} is covered by the signature; the log entry is not fetched`,
            },
    );

    if (args.endpoint === null) {
        lines.push({
            name: "endpoint",
            state: "fail",
            detail: `${payload.endpoint} is not in the local catalog`,
        });
        lines.push({
            name: "docHash",
            state: "skip",
            detail: "no local doc",
        });
        lines.push({
            name: "upstream",
            state: "skip",
            detail: "no local doc",
        });
    } else if (args.endpoint) {
        const doc = args.endpoint;
        lines.push({
            name: "endpoint",
            state: doc.id === payload.endpoint ? "ok" : "fail",
            detail: doc.id === payload.endpoint
                ? payload.endpoint
                : `receipt ${payload.endpoint} vs local ${doc.id}`,
        });
        lines.push({
            name: "docHash",
            state: doc.docHash === payload.docHash ? "ok" : "fail",
            detail: doc.docHash === payload.docHash
                ? payload.docHash
                : `local ${doc.docHash} vs receipt ${payload.docHash}`,
        });
        lines.push({
            name: "upstream",
            state: doc.upstream === payload.upstream ? "ok" : "fail",
            detail: doc.upstream === payload.upstream
                ? payload.upstream
                : `local ${doc.upstream} vs receipt ${payload.upstream}`,
        });
    }

    if (args.input === undefined) {
        lines.push({
            name: "inputHash",
            state: "skip",
            detail: "no input supplied",
        });
    } else {
        let inputHash: string;
        try {
            inputHash = await hashReceiptInput(args.input);
        } catch (error) {
            lines.push({
                name: "inputHash",
                state: "fail",
                detail: (error as Error).message,
            });
            inputHash = "";
        }
        if (inputHash) {
            lines.push({
                name: "inputHash",
                state: inputHash === payload.inputHash ? "ok" : "fail",
                detail: inputHash === payload.inputHash
                    ? "matches the signed inputHash"
                    : "does not match the signed inputHash",
            });
        }
    }

    if (args.hostedOutput !== undefined) {
        let hostedHash = "";
        try {
            hostedHash = await hashReceiptOutput(args.hostedOutput);
        } catch (error) {
            lines.push({
                name: "hostedOutput",
                state: "fail",
                detail: (error as Error).message,
            });
        }
        if (hostedHash) {
            lines.push({
                name: "hostedOutput",
                state: hostedHash === payload.outputHash ? "ok" : "fail",
                detail: hostedHash === payload.outputHash
                    ? "matches the signed outputHash"
                    : "does not match the signed outputHash",
            });
        }
    }

    const blocked = lines.some((line) =>
        line.state === "fail" &&
        (line.name === "signature" || line.name === "endpoint" ||
            line.name === "docHash" || line.name === "upstream" ||
            line.name === "inputHash" || line.name === "hostedOutput")
    );
    const wantsReplay = args.replay !== undefined && args.replay !== false;
    const bitStable = isBitStable(
        payload.endpoint,
        args.deterministic === true,
        args.deterministicEndpoints ?? DETERMINISTIC_ENDPOINTS,
    );

    if (!wantsReplay) {
        lines.push({
            name: "replay",
            state: "skip",
            detail: "not requested",
        });
    } else if (blocked) {
        lines.push({
            name: "replay",
            state: "skip",
            detail: "not replayed because an earlier check failed",
        });
    } else if (args.input === undefined) {
        lines.push({
            name: "replay",
            state: "fail",
            detail: "replay needs the original run input (--input)",
        });
    } else {
        let replayed: ReplayResult;
        try {
            replayed = typeof args.replay === "function"
                ? await args.replay()
                : args.replay as ReplayResult;
        } catch (error) {
            lines.push({
                name: "replay",
                state: "fail",
                detail: (error as Error).message ?? String(error),
            });
            replayed = undefined as unknown as ReplayResult;
        }
        if (replayed) {
            lines.push({
                name: "replay",
                state: "ok",
                detail: "executed locally with the caller provider key",
            });
            lines.push(statusLine(replayed, args.hostedStatus));
            lines.push(await outputHashLine(payload, replayed, bitStable));
            if (args.endpoint?.outputSchema) {
                lines.push(schemaLine(
                    args.endpoint.outputSchema,
                    replayed.output,
                    args.validateOutput,
                ));
            } else {
                lines.push({
                    name: "schema",
                    state: "skip",
                    detail: "endpoint has no output schema",
                });
            }
            if (args.hostedOutput !== undefined) {
                lines.push(diffLine(args.hostedOutput, replayed.output));
            }
        }
    }

    return {
        exitCode: lines.some((line) => line.state === "fail") ? 1 : 0,
        header:
            `${payload.endpoint}  ${payload.runId}  ${payload.charged}  ${payload.at}`,
        lines,
        bitStable,
    };
}

function statusLine(
    replayed: ReplayResult,
    hostedStatus: number | undefined,
): ReportLine {
    const provider = replayed.isProviderError ? " (provider error)" : "";
    if (hostedStatus === undefined) {
        return {
            name: "status",
            state: "ok",
            detail: `local HTTP ${replayed.httpStatus}${provider}`,
        };
    }
    if (hostedStatus === replayed.httpStatus) {
        return {
            name: "status",
            state: "ok",
            detail: `HTTP ${replayed.httpStatus}${provider}`,
        };
    }
    return {
        name: "status",
        state: "differs",
        detail:
            `local HTTP ${replayed.httpStatus}${provider}, hosted HTTP ${hostedStatus}`,
    };
}

async function outputHashLine(
    payload: ReceiptPayload,
    replayed: ReplayResult,
    bitStable: boolean,
): Promise<ReportLine> {
    let localHash: string;
    try {
        localHash = await hashReceiptOutput(replayed.output);
    } catch (error) {
        return {
            name: "outputHash",
            state: "fail",
            detail: (error as Error).message,
        };
    }
    const match = localHash === payload.outputHash;
    if (bitStable) {
        return {
            name: "outputHash",
            state: match ? "ok" : "fail",
            detail: match
                ? "conclusive: the replay outputHash matches and this endpoint is treated as bit-stable"
                : "conclusive: the replay outputHash does not match and this endpoint is treated as bit-stable",
        };
    }
    return {
        name: "outputHash",
        state: "skip",
        detail: match
            ? "the replay outputHash matches, but the provider response is not bit-stable, so this is not conclusive"
            : "the replay outputHash differs; the provider response is not bit-stable, so this is not conclusive",
    };
}

function schemaLine(
    schema: Record<string, Json>,
    output: unknown,
    validate: OutputValidator | undefined,
): ReportLine {
    if (!validate) {
        return {
            name: "schema",
            state: "skip",
            detail: "output schema present but not checked",
        };
    }
    try {
        const result = validate(schema, output);
        return result.ok
            ? {
                name: "schema",
                state: "ok",
                detail: "local output matches the endpoint output schema",
            }
            : {
                name: "schema",
                state: "differs",
                detail: result.message,
            };
    } catch (error) {
        return {
            name: "schema",
            state: "differs",
            detail: (error as Error).message,
        };
    }
}

function diffLine(hostedOutput: unknown, localOutput: unknown): ReportLine {
    const hosted = receiptOutput(hostedOutput);
    const local = receiptOutput(localOutput);
    const { entries, truncated } = diffJson(hosted, local);
    if (entries.length === 0 && truncated === 0) {
        return {
            name: "diff",
            state: "ok",
            detail: "local output matches the hosted output",
        };
    }
    const shown = entries.length;
    const total = shown + truncated;
    return {
        name: "diff",
        state: "differs",
        detail: truncated
            ? `${total} changes, showing ${shown}`
            : `${total} ${total === 1 ? "change" : "changes"}`,
        notes: entries.map(diffNote),
    };
}
