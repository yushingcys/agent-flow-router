import { defineProvider, presets } from "@shared/core";

/**
 * Strale (strale.dev) - a registry of small paid tools for agents: company
 * registry lookups across ~25 countries, KYC / AML / sanctions screening,
 * IBAN / VAT / LEI validation, web and domain checks, document and text
 * extraction, developer utilities, and multi-step "solutions" that bundle
 * several checks into one priced call. A provider name cannot carry a dot
 * (design D1): Monid's slug is `api.strale.io`.
 *
 * ONE WIRE SURFACE, keyed: a capability runs as `POST /v1/do
 * {capability_slug, inputs, max_price_cents}`, a solution as `POST
 * /v1/solutions/<slug>/execute {inputs, max_price_cents}`, Bearer
 * `sk_live_...`. Endpoint ids are Monid's x402 paths (`x402/<slug>`,
 * `x402/v2/<slug>`, `x402/solutions/<slug>`), declared as `endpoint:`
 * (design D22). Each endpoint's input body is the capability's own
 * `inputs` object; its `toRequest` wraps it with the fixed slug and a
 * `max_price_cents` pinned at the catalog price, so a repriced capability
 * fails uncharged (`budget_exceeded`) instead of billing above its card.
 *
 * ASYNC BY MEASURED LATENCY. Strale routes a paid capability whose
 * average latency passes 10 s to its async lane (a runtime statistic, not
 * a catalog field): `/v1/do` answers 202 `{result: {transaction_id,
 * status: "executing"}}` and the run is read back from `GET
 * /v1/transactions/<id>`. Every endpoint can land there, so the lifecycle
 * lives on the provider: start relays the call and returns a sync answer
 * at once; a 202 polls the transaction record, whose completed body rides
 * out as `{result: <transaction>}` so `result.output` and
 * `result.price_cents` read the same either way.
 *
 * BILLING. Strale bills a prepaid EUR wallet, per run, at the catalog
 * price (`GET /v1/capabilities` `price_cents`, EUR cents; solutions at
 * `GET /v1/solutions`). So the pool is euros (the "US dollars" pool shape
 * of dollar-priced vendors) and each endpoint pins its own list price as
 * one `RESULT` (a charged run). Every response states the charge in
 * `result.price_cents`: that is the vendor's claim (D27) and wins at
 * settle. A run Strale does not charge (free-tier capabilities, which are
 * free with a key too; a solution refunded because a gate stopped it)
 * reports 0, and evidence counts 0 runs so the fold agrees. Responses also
 * carry `wallet_balance_cents`, OUR balance, which never reaches a caller.
 * A failed run is refunded upstream and settles as an error at zero.
 */
export default defineProvider({
    name: "strale",
    meta: {
        displayName: "Strale",
        summary: "Company data, compliance checks, validation, and web " +
            "tools for agents, paid per call.",
        description: "Strale's tool registry for agents: company registry " +
            "lookups across Europe, the US, Canada, Brazil, Japan, " +
            "Australia and Singapore; KYB bundles; sanctions, PEP, " +
            "adverse-media and AML screening; IBAN, VAT, LEI, email, phone " +
            "and wallet-address validation; DNS, WHOIS, SSL, page speed and " +
            "tech-stack checks; web, PDF, invoice and contract extraction; " +
            "and developer utilities. Every run returns its output with a " +
            "provenance record (data source and fetch time).",
        homepageUrl: "https://strale.dev",
        docsUrl: "https://strale.dev/docs",
        categories: ["company-enrichment"],
        notes: [
            "Billed in euros at Strale's catalog price per run; " +
            "the response's `result.price_cents` settles the bill. Failed " +
            "runs are refunded and not billed.",
            "Slow capabilities run asynchronously upstream and complete on " +
            "a later poll; their `result` is Strale's transaction record " +
            "(`id`, `status`, `output`, `price_cents`, `provenance`).",
            "Inputs are validated against Strale's catalog schema; Strale " +
            "rejects missing or malformed fields with 400 " +
            "`invalid_request` and a `details.fix` hint, at no charge.",
        ],
    },
    auth: { inject: presets.auth.bearer() },
    request: { baseUrl: "https://api.strale.io" },
    // sync paid runs get `timeout_seconds: 60` upstream (its maximum)
    timeouts: { requestMs: 75_000, runMs: 300_000, pollMs: 3_000 },
    lifecycle: {
        start: async ({ utils }) => {
            const res = await utils.request();
            if (res.status === 202) {
                const id = utils.json.optionalGet(
                    res.body,
                    "$.result.transaction_id",
                );
                if (typeof id !== "string" || id === "") {
                    throw Object.assign(
                        new Error("Strale 202 without a transaction_id"),
                        { retriable: false },
                    );
                }
                return { kind: "RUNNING", state: { externalRunId: id } };
            }
            // a 2xx whose run failed (a solution with every step failed)
            // was refunded upstream: an error, never a billable success
            const status = utils.json.optionalGet(res.body, "$.result.status");
            if (res.status >= 200 && res.status < 300 && status === "failed") {
                return {
                    kind: "COMPLETED",
                    httpStatus: 502,
                    providerHttpStatus: res.status,
                    output: res.body,
                };
            }
            return {
                kind: "COMPLETED",
                httpStatus: res.status,
                output: res.body,
            };
        },
        poll: async ({ data, utils }) => {
            const id = data.lifecycle.state.externalRunId;
            if (id === undefined) {
                throw Object.assign(
                    new Error("strale poll without externalRunId in state"),
                    { retriable: false },
                );
            }
            const res = await utils.http({
                method: "GET",
                path: "/v1/transactions/" + encodeURIComponent(id),
            });
            // the run is paid for and executing: an upstream blip on the
            // read is not its answer, keep polling (runMs bounds the wait)
            if (res.status === 429 || res.status >= 500) {
                return { kind: "RUNNING" };
            }
            if (res.status < 200 || res.status >= 300) {
                return {
                    kind: "COMPLETED",
                    httpStatus: res.status,
                    output: res.body,
                };
            }
            const status = utils.json.optionalGet(res.body, "$.status");
            if (status === "completed") {
                return {
                    kind: "COMPLETED",
                    httpStatus: 200,
                    output: { result: res.body },
                };
            }
            if (status === "failed") {
                return {
                    kind: "COMPLETED",
                    httpStatus: 502,
                    providerHttpStatus: res.status,
                    output: res.body,
                };
            }
            return { kind: "RUNNING" };
        },
    },
    usage: {
        credits: {
            default: {
                label: "euros",
                description: "the Strale wallet balance in EUR; each " +
                    "endpoint states its catalog price per run",
            },
        },
        estimate: ({ data }) => {
            const counts: Record<string, number> = {};
            if (data.usage.model.kind !== "FREE") counts.RESULT = 1;
            return { counts };
        },
        /** One charged run, unless Strale reports it charged nothing. */
        evidence: ({ data, utils }) => {
            const counts: Record<string, number> = {};
            if (data.usage.model.kind === "FREE") return { counts };
            const cents = utils.json.optionalNum(
                data.output,
                "$.result.price_cents",
            );
            counts.RESULT = cents === 0 ? 0 : 1;
            return { counts };
        },
        /** The vendor's claim: `result.price_cents` (EUR cents) as euros.
         *  `wallet_balance_cents` is our balance, plucked from `result`
         *  and (solutions) `meta`. */
        consolidate: ({ data, utils }) => {
            const a = utils.json.pluck(
                data.output,
                "$.result.wallet_balance_cents",
            );
            const b = utils.json.pluck(a.rest, "$.meta.wallet_balance_cents");
            const cents = data.usage.model.kind === "FREE"
                ? undefined
                : utils.json.optionalNum(b.rest, "$.result.price_cents");
            return {
                credits: {
                    ...(cents !== undefined && cents > 0
                        ? { default: cents / 100 }
                        : {}),
                },
                output: b.rest,
            };
        },
    },
    output: {
        /** Strale errors are flat `{error_code, message, details}`; a
         *  failed async run is the transaction record with `error`; a
         *  failed solution is `{result: {status, errors}}`. The wallet
         *  balance some of them carry is ours and is dropped. */
        fromError: ({ data, utils }) => {
            const a = utils.json.pluck(
                data.output,
                "$.details.wallet_balance_cents",
            );
            const b = utils.json.pluck(a.rest, "$.result.wallet_balance_cents");
            const c = utils.json.pluck(b.rest, "$.meta.wallet_balance_cents");
            const message = [
                utils.json.optionalGet(data.output, "$.message"),
                utils.json.optionalGet(data.output, "$.error"),
                utils.json.optionalGet(data.output, "$.result.errors[0]"),
            ].find((v) => typeof v === "string" && v !== "");
            const code = utils.json.optionalGet(data.output, "$.error_code");
            return {
                message: typeof message === "string"
                    ? message
                    : "Strale API error",
                ...(typeof code === "string" ? { error_code: code } : {}),
                raw: c.rest,
            };
        },
    },
});
