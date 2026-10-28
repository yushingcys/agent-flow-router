import type { Json } from "@shared/core";
import { applyAuth, credentialEnvVarsFor, credentialFieldsOf } from "./auth.ts";
import { EngineError, EngineErrorCode } from "./errors.ts";
import type {
    ParamsResolver,
    PreparedRequest,
    Transport,
    TransportResponse,
} from "./interfaces/mod.ts";

/**
 * Does this content type carry BYTES rather than text? Text is `text/*` plus
 * the textual `application/*` families (JSON, XML, JavaScript, form data,
 * SSE); an absent type is read as text (the pre-binary behavior). Everything
 * else (audio, image, video, octet-stream, pdf, zip, msgpack) is binary.
 */
export function isBinaryContentType(contentType: string | undefined): boolean {
    if (contentType === undefined) return false;
    const type = contentType.split(";")[0].trim().toLowerCase();
    if (type === "" || type.startsWith("text/")) return false;
    return !/json|xml|javascript|x-www-form-urlencoded|event-stream/.test(
        type,
    );
}

/**
 * Sniffing decode — the universal body rule (no per-endpoint flag): JSON if
 * it parses, else the COMPLETE raw body as a faithful string (a string IS
 * Json). Bytes (a base64 transport body) decode to `{contentType, base64}`,
 * the BinaryPart spelling a multipart request takes back. Shared by the
 * pipeline and utils.http; vendor error pages are already flagged by the
 * HTTP status (isProviderError / the fn's choice).
 */
export function sniffDecode(response: TransportResponse): Json {
    if (response.bodyEncoding === "base64") {
        return {
            contentType: response.contentType ?? "application/octet-stream",
            base64: response.body,
        };
    }
    const text = response.body;
    if (text.trim() === "") return null;
    try {
        return JSON.parse(text) as Json;
    } catch {
        return text;
    }
}

/** A multipart body (zMultipartBody, validated where fns hand it over) as
 *  FormData: arrays repeat the field, `{base64}` objects become file parts. */
function toFormData(body: Json | undefined): FormData {
    const form = new FormData();
    if (body === null || typeof body !== "object" || Array.isArray(body)) {
        return form;
    }
    for (const [key, value] of Object.entries(body)) {
        for (const part of Array.isArray(value) ? value : [value]) {
            if (part !== null && typeof part === "object" && "base64" in part) {
                const file = part as {
                    base64: string;
                    contentType?: string;
                    filename?: string;
                };
                form.append(
                    key,
                    new Blob([Uint8Array.fromBase64(file.base64)], {
                        type: file.contentType ?? "application/octet-stream",
                    }),
                    file.filename ?? key,
                );
            } else {
                form.append(key, String(part));
            }
        }
    }
    return form;
}

/**
 * The default resolver, ONE convention: read `<NAME>_CREDENTIALS_<FIELD>`
 * for every field the doc's credential shape declares (plus the single
 * `<NAME>_API_KEY` alias for a field named `apiKey`). `fields` comes from
 * the doc — a caller that omits it gets the `{apiKey}` default shape.
 *
 * A variable that is SET BUT EMPTY is reported as the empty string, not
 * skipped: the credential schema's own `.min(1)` then rejects it as
 * MISSING_CREDENTIAL naming the variable. Blanking the canonical name is a
 * configuration error, never a silent fall-through to the alias.
 *
 * The resolver only READS; the injector validates the result against the
 * doc's credentials schema.
 */
export const envParamsResolver: ParamsResolver = (provider, fields) => {
    const params: Record<string, string> = {};
    for (const field of fields ?? ["apiKey"]) {
        const value = resolveCredentialEnv(provider, field);
        if (value !== undefined) params[field] = value;
    }
    return Promise.resolve(params);
};

/**
 * THE precedence rule, in ONE place: the first variable that is DEFINED wins,
 * whatever its value. A set-but-EMPTY canonical name therefore SHADOWS the
 * alias and is returned as `""` rather than skipped — blanking it is a
 * configuration error, and the credential schema's own `.min(1)` rejects it
 * by name. Falling through to the alias would hide a broken deployment.
 *
 * Every reader of the convention resolves through here — the params resolver,
 * the live-test gate, and the drift suites — so the three can never disagree
 * about which variable supplies a field. They did once: the gate treated an
 * empty canonical as absent and opened onto a run that was then guaranteed to
 * fail MISSING_CREDENTIAL, so a live test ran and failed instead of skipping.
 */
export function resolveCredentialEnv(
    provider: string,
    field: string,
): string | undefined {
    for (const name of credentialEnvVarsFor(provider, field)) {
        const value = Deno.env.get(name);
        if (value !== undefined) return value;
    }
    return undefined;
}

/** Live-test gate: does every declared credential field resolve to a
 *  NON-EMPTY value? Same precedence as the resolver (above), so the gate
 *  never opens onto a run the resolver would reject. `fields` defaults to
 *  the `{apiKey}` shape. */
export function envCredentialsPresent(
    provider: string,
    fields?: readonly string[],
): boolean {
    const wanted = fields ?? ["apiKey"];
    return wanted.length > 0 &&
        wanted.every((field) => {
            const value = resolveCredentialEnv(provider, field);
            return value !== undefined && value !== "";
        });
}

/**
 * OSS / local / tests: inject credentials HERE, then fetch.
 * `fetch` is injectable → fixture replay. Resolved values never logged.
 */
export function directTransport(opts: {
    params?: ParamsResolver;
    fetch?: typeof fetch;
} = {}): Transport {
    const resolveParams = opts.params ?? envParamsResolver;
    const doFetch = opts.fetch ?? fetch;
    return {
        async execute(req: PreparedRequest): Promise<TransportResponse> {
            // No auth block ⇒ the request egresses BARE (same-origin
            // credential rule, design D16) — credentials are never even
            // resolved for it.
            const authed = req.auth
                ? await applyAuth(
                    { ...req, auth: req.auth },
                    // the DOC states which credential fields exist; the
                    // resolver reads exactly those variables and no others
                    await resolveParams(
                        req.provider,
                        credentialFieldsOf(req.auth.credentials),
                    ),
                )
                : {
                    url: req.url,
                    headers: { ...req.headers },
                    query: { ...req.query },
                    ...(req.body !== undefined ? { body: req.body } : {}),
                };

            const url = new URL(authed.url);
            for (const [key, values] of Object.entries(authed.query)) {
                // append (never set) once per value — several values under
                // one key IS the repeated-parameter spelling, and ORDER is
                // the caller's
                for (const value of values) url.searchParams.append(key, value);
            }

            const controller = new AbortController();
            const timer = setTimeout(
                () => controller.abort(),
                req.timeouts.requestMs,
            );
            try {
                const multipart = req.bodyEncoding === "multipart";
                const response = await doFetch(url.toString(), {
                    method: req.method,
                    // multipart: fetch writes the content-type itself, so
                    // the boundary in it matches the encoded body
                    headers: {
                        ...(authed.body !== undefined && !multipart
                            ? { "content-type": "application/json" }
                            : {}),
                        ...authed.headers,
                    },
                    body: authed.body === undefined
                        ? undefined
                        : multipart
                        ? toFormData(authed.body)
                        : JSON.stringify(authed.body),
                    signal: controller.signal,
                    redirect: "manual",
                });
                const binary = isBinaryContentType(
                    response.headers.get("content-type") ?? undefined,
                );
                const body = binary
                    ? new Uint8Array(await response.arrayBuffer()).toBase64()
                    : await response.text();
                return {
                    status: response.status,
                    body,
                    ...(binary ? { bodyEncoding: "base64" as const } : {}),
                    // `redirect: "manual"` above means a 3xx arrives WITH its
                    // Location intact and an empty body — the header IS the
                    // payload for presigned-URL endpoints. Header keys are
                    // lowercased (multi-values comma-joined) by the Fetch
                    // spec's Headers iterator.
                    headers: Object.fromEntries(response.headers),
                    contentType: response.headers.get("content-type") ??
                        undefined,
                };
            } catch (error) {
                if (error instanceof EngineError) throw error;
                throw new EngineError(
                    EngineErrorCode.EXECUTION_FAILED,
                    `transport failure calling ${req.provider}: ${error}`,
                    { cause: error },
                );
            } finally {
                clearTimeout(timer);
            }
        },
    };
}

/**
 * Hosted mode (interface stub — the implementation lives in the hosted gateway):
 * forwards the PreparedRequest — auth fn ref + entry INTACT, credentials absent —
 * to the Relay, which validates authParams against the Broker credential (KMS),
 * hash-verifies and runs the same auth fn, applies egress hygiene, and returns
 * {status, body}. Secrets never enter the engine process.
 */
export function relayTransport(_opts: {
    relayUrl: string;
    callerAuth: () => Promise<string>;
}): Transport {
    return {
        execute(): Promise<TransportResponse> {
            return Promise.reject(
                new EngineError(
                    EngineErrorCode.NOT_IMPLEMENTED,
                    "relayTransport is implemented by the hosted Relay (the hosted gateway)",
                ),
            );
        },
    };
}
