import { defineProvider, presets } from "@shared/core";

/**
 * Browserbase (browserbase.com) - cloud headless browsers plus lightweight
 * Fetch and Search APIs. Synchronous JSON endpoints against
 * `https://api.browserbase.com`, auth `X-BB-API-Key: <key>`.
 *
 * Endpoint ids follow Monid's listing, which sells Browserbase's own
 * pay-per-use gateway (x402.browserbase.com, read 2026-10-27): `/fetch`,
 * `/search`, `/browser/session/create` and `/browser/session/{id}/extend`.
 * The gateway takes crypto payments only, so the connector calls the
 * account API behind it and bills at the gateway's published rate card:
 * $0.01 per fetch, $0.01 per search, and browser time prepaid at
 * $0.12/hour ($0.002/minute) with a $0.01 (5-minute) minimum. The account
 * plans are cheaper per call (docs.browserbase.com account/billing/plans:
 * Fetch $1-4/1k, Search $1-12/1k, browsers $0.10-0.12/hour), so the
 * gateway card covers every mode.
 *
 * Extend is not exposed: the account API fixes a session's `timeout` at
 * creation and offers no way to add time (update-a-session only accepts
 * `REQUEST_RELEASE`).
 */
export default defineProvider({
    name: "browserbase",
    meta: {
        displayName: "Browserbase",
        summary: "Cloud headless browsers, page fetch and web search.",
        description: "Cloud browser infrastructure for AI agents - start a " +
            "headless Chrome session in the cloud and drive it over CDP " +
            "with Playwright, Puppeteer or Selenium (captcha solving, " +
            "session recording and persistent contexts built in), fetch a " +
            "page's raw content, markdown or schema-extracted JSON without " +
            "a browser, and run a web search that returns structured " +
            "results.",
        homepageUrl: "https://www.browserbase.com",
        docsUrl: "https://docs.browserbase.com/reference/api/overview",
        categories: ["browser-automation", "web-scraping", "web-search"],
    },
    auth: { inject: presets.auth.header("X-BB-API-Key") },
    request: { baseUrl: "https://api.browserbase.com" },
    timeouts: { requestMs: 60_000, runMs: 70_000 },
    usage: {
        /** THE credit system (design D26): the gateway rate card is in
         *  dollars, so the pool is US dollars. */
        credits: { default: { label: "US dollars" } },
    },
    output: {
        /** Browserbase's error envelope is `{statusCode, error, message}`
         *  (OpenAPI 4xx schemas). Vendor non-2xx is DATA - zero-billed. */
        fromError: ({ data, utils }) => {
            const message = utils.json.optionalGet(data.output, "$.message");
            return {
                message: typeof message === "string" && message !== ""
                    ? message
                    : "Browserbase API error",
                raw: data.output,
            };
        },
    },
});
