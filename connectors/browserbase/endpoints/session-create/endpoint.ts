import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zBrowserbaseSessionCreateBody } from "./schema/inputs.ts";

/**
 * POST /v1/sessions - start a cloud browser.
 *
 * BILLING: browser time is PREPAID for the whole `timeout` at the gateway
 * card (provider.ts): $0.01 covers the first 5 minutes, each further
 * started minute is $0.002. `timeout` is therefore REQUIRED at the binding
 * (D25 - the project default is unknown at estimate time). Proxies are not
 * offered: their bandwidth is metered per GB after the call returns and
 * has no per-call bound.
 */
export default defineEndpoint({
    meta: {
        displayName: "Browserbase Create Session",
        summary: "Start a cloud headless browser and get its connect URL.",
        description: "Start a headless Chrome session in Browserbase's cloud " +
            "and get back its id and a `connectUrl` WebSocket to drive it " +
            "over CDP with Playwright or Puppeteer (or `seleniumRemoteUrl` " +
            "plus `signingKey` for Selenium). Set how long it may run with " +
            "`timeout` (60-21600 seconds); the session ends at the timeout " +
            "or when your client disconnects, unless `keepAlive` is set. " +
            "Captcha solving and recording are on by default; reuse logins " +
            "through a saved context, set viewport, OS, region, ad blocking " +
            "and allowed domains. Costs $0.01 for the first 5 minutes of " +
            "`timeout`, then $0.002 per minute, charged up front.",
        docsUrl: "https://docs.browserbase.com/reference/api/create-a-session",
        categories: ["browser-automation"],
        notes: [
            "The whole `timeout` is charged even if the session ends early.",
            "The connect URL is a live credential for the session; do not " +
            "share it.",
        ],
    },
    endpoint: "/browser/session/create",
    request: { method: "POST", path: "/v1/sessions" },
    input: {
        schema: {
            body: zBrowserbaseSessionCreateBody
                .omit({ proxies: true, proxySettings: true })
                .required({ timeout: true }),
        },
    },
    usage: {
        model: {
            kind: UsageModelKind.COMPOSITE,
            components: {
                session: {
                    kind: UsageModelKind.PER_CALL,
                    label: "first 5 minutes",
                    consumes: { credit: "default", amount: 0.01 },
                },
                extra_minute: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.MINUTE,
                    label: "minutes beyond 5",
                    description: "$0.002 per started minute of timeout " +
                        "past the first 5",
                    consumes: { credit: "default", amount: 0.002 },
                },
            },
        },
        estimate: ({ data }) => ({
            counts: {
                extra_minute: Math.max(
                    0,
                    Math.ceil(data.input.body.timeout / 60) - 5,
                ),
            },
        }),
        evidence: ({ data }) => ({
            counts: {
                extra_minute: Math.max(
                    0,
                    Math.ceil(data.input.body.timeout / 60) - 5,
                ),
            },
        }),
    },
});
