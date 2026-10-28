import { defineProvider, UsageModelKind } from "@shared/core";

/**
 * DefiLlama (defillama.com) - DeFi and crypto analytics: TVL by protocol
 * and chain, token prices, stablecoins, yields, fees and revenue, DEX,
 * options and perp volumes, unlocks, raises, hacks, treasuries, bridges,
 * RWA, ETFs and equities. Synchronous GETs.
 *
 * Two surfaces, matching Monid's listing (monid.ai/tools/defillama):
 *   - the Pro API at `https://pro-api.llama.fi/{API_KEY}/...` - every
 *     endpoint whose id is the vendor's own Pro path (`defillama#api/...`,
 *     `#coins/...`, `#yields/...`). The key travels IN THE PATH, never a
 *     header or query parameter, so `inject` splices it in after the origin.
 *   - the keyless public API (api/coins/stablecoins.llama.fi) under
 *     `defillama#free/...`. Those endpoints declare an empty credential
 *     shape and a pass-through inject, so they never need or send a key.
 *
 * Rate card (api-docs.defillama.com llms-pro.txt, read 2026-10-27): one
 * API plan at $300/month whose key carries monthly credits (the docs'
 * example balance is 1,000,000), one per call; the free API is
 * unmetered. Monid sells Pro calls at $0.0003 or $0.0006 per call by
 * endpoint, which `deno task monid:prices` maps onto this one pool. Responses carry no usage receipt, so there is no
 * `consolidate` - the derived fold is the bill.
 *
 * Endpoint defs are GENERATED from DefiLlama's OpenAPI spec by
 * `deno task defillama:scaffold` - edit the script, not the endpoints.
 * Not exposed: `/usage/{key}` (account meta, the key itself is the path),
 * and the free yields `/pools` and `/chart/{pool}`, which DefiLlama shuts
 * down on 2026-11-13 (the Pro `yields/v1/...` twins remain).
 *
 * `deno task record` keeps request URLs verbatim, so a recorded Pro
 * fixture holds the real key in its URL: replace it with `test-key`
 * before committing.
 */
export default defineProvider({
    name: "defillama",
    meta: {
        displayName: "DefiLlama",
        summary: "DeFi and crypto analytics: TVL, prices, stablecoins, " +
            "yields, fees, volumes, unlocks, raises and more.",
        description: "DeFi and crypto analytics from DefiLlama's open " +
            "dataset - TVL by protocol and chain, current and historical " +
            "token prices, stablecoin supply, yield pools and borrow " +
            "markets, fees and revenue, DEX, options and perp volumes and " +
            "open interest, token unlocks, funding raises, hacks, " +
            "protocol treasuries, bridges, real-world assets, crypto ETF " +
            "flows, digital asset treasuries, and equities and pre-IPO " +
            "company data. Free endpoints (`free/...`) mirror the most " +
            "used public datasets at no charge.",
        homepageUrl: "https://defillama.com",
        docsUrl: "https://api-docs.defillama.com",
        categories: ["defi"],
        notes: [
            "Protocol, chain and category arguments are DefiLlama slugs " +
            "(`aave`, `Ethereum`, `Lending`); list them with " +
            "`api/protocols`, `api/v2/chains` and `api/categories`.",
            "Token ids in `coins` are `chain:address` or " +
            "`coingecko:<id>`, comma-separated for several tokens.",
            "Several list endpoints return multi-megabyte payloads " +
            "(all protocols, all pools, all stablecoins).",
        ],
    },
    auth: {
        /** Pro key goes between the origin and the path. */
        inject: ({ data }) => {
            const url = data.request.url;
            const cut = url.indexOf("/", url.indexOf("://") + 3);
            return {
                ...data.request,
                url: url.slice(0, cut) + "/" +
                    encodeURIComponent(data.params.apiKey) + url.slice(cut),
            };
        },
    },
    request: { baseUrl: "https://pro-api.llama.fi" },
    timeouts: { requestMs: 60_000, runMs: 60_000 },
    usage: {
        /** THE credit system (design D26): DefiLlama meters API calls; the
         *  $/call conversion comes from Monid's listing. */
        credits: { default: { label: "DefiLlama API calls" } },
        model: {
            kind: UsageModelKind.PER_CALL,
            label: "call",
            consumes: { credit: "default", amount: 1 },
        },
    },
    output: {
        /** DefiLlama errors are plain text or `{message}` / `{error}`. */
        fromError: ({ data, utils }) => {
            const text = [
                data.output,
                utils.json.optionalGet(data.output, "$.message"),
                utils.json.optionalGet(data.output, "$.error"),
            ].find((v) => typeof v === "string" && v !== "");
            return {
                message: typeof text === "string"
                    ? text.slice(0, 500)
                    : "DefiLlama API error",
                raw: data.output,
            };
        },
    },
});
