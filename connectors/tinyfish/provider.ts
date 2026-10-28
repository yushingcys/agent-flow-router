import { defineProvider, presets, UsageModelKind } from "@shared/core";

/**
 * TinyFish (tinyfish.ai) - the live web four ways, each product on its own
 * host behind ONE API key: Search (`api.search`), Fetch (`api.fetch`), the
 * AI browser Agent plus Browser Context Profiles (`agent`), and remote CDP
 * browser sessions (`api.browser`).
 *
 * BASE URL: the provider default is the BROWSER host because the one
 * resource, `tinyfish/browser-session`, runs its ops under the provider's
 * fused origin (auth travels same-origin only, D16) and its teardown and
 * usage meter live there. Every other endpoint declares its own
 * `request.baseUrl`.
 *
 * BILLING: TinyFish bills a pay-as-you-go WALLET in dollars
 * (https://www.tinyfish.ai/pricing, checked 2026-10-27): Search and Fetch
 * are free (plans differ on rate limit, not price), the Agent is $0.016
 * per step, a remote browser is $0.002 per minute. So the provider default
 * model stays FREE and the one pool is US dollars, drained by
 * /automation/run and the browser-session resource. No response carries a
 * monetary claim, so there is no `consolidate` (D27).
 */
export default defineProvider({
    name: "tinyfish",
    meta: {
        displayName: "TinyFish",
        summary:
            "Live-web search and fetch, an AI browser agent, and remote browsers.",
        description: "The live web for agents: zero-cost browser-rendered " +
            "web, news, and research-paper search; clean Markdown, HTML, " +
            "or JSON extraction for up to 10 URLs per call; an AI browser " +
            "agent that navigates, clicks, and extracts from a " +
            "natural-language goal (billed per step), with saved-login " +
            "Browser Context Profiles; and rentable remote CDP browser " +
            "sessions you drive yourself (billed per minute).",
        homepageUrl: "https://tinyfish.ai",
        docsUrl: "https://docs.tinyfish.ai",
        categories: ["web-search", "web-scraping"],
    },
    auth: { inject: presets.auth.header("X-API-Key") },
    request: { baseUrl: "https://api.browser.tinyfish.ai" },
    usage: {
        credits: { default: { label: "US dollars" } },
        // FREE by default (designs D25/D27): search, fetch, and every
        // profile/session control call bill nothing; the metered endpoints
        // override. A future price change is a MODEL change, not a
        // rate-card surprise.
        model: { kind: UsageModelKind.FREE },
    },
});
