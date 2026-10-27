import { defineProvider, presets } from "@shared/core";

/**
 * Tavily (tavily.com) - web search, extraction, crawling and site mapping
 * built for AI agents. Four synchronous JSON endpoints against
 * `https://api.tavily.com`, auth `Authorization: Bearer <key>`.
 *
 * Billing is in Tavily's own API credits (docs.tavily.com
 * documentation/api-credits, read 2026-10-23): search 1 credit (2 for
 * `advanced`), extract 1 credit per 5 successful URLs (2 for `advanced`),
 * map 1 credit per 10 pages (2 with `instructions`), crawl = map + extract.
 * The per-5 / per-10 rates are modeled as fractional per-unit amounts
 * (0.2 / 0.1 credits) rather than `every` blocks: Tavily documents that a
 * request's reported usage "may be 0" until the account's running total
 * reaches a block, so the vendor accrues across requests and a per-call
 * round-up would overcharge every small call.
 *
 * Research (`/research`) is not exposed: it is an async task with a
 * dynamic 4-250 credit range and no per-request formula.
 */
export default defineProvider({
    name: "tavily",
    meta: {
        displayName: "Tavily",
        summary: "Web search, extraction, crawl and site map for AI agents.",
        description: "Real-time web search and content extraction built " +
            "for AI agents - ranked results with relevant content snippets " +
            "and an optional LLM-written answer, clean markdown or text " +
            "from up to 20 URLs per call, a graph-based crawler that " +
            "extracts a whole site section in one request, and a site " +
            "mapper that lists a domain's URLs without fetching content. " +
            "Search supports general, news and finance topics, date and " +
            "domain filters, and country or language boosting; crawl and " +
            "map accept natural-language instructions to steer which pages " +
            "they follow.",
        homepageUrl: "https://tavily.com",
        docsUrl: "https://docs.tavily.com/documentation/api-reference/" +
            "introduction",
        categories: ["web-search", "web-scraping"],
    },
    auth: { inject: presets.auth.bearer() },
    request: { baseUrl: "https://api.tavily.com" },
    /** Sized for the slowest endpoint: crawl and map accept a vendor
     *  `timeout` of up to 150 s, so the transport must outlast it. */
    timeouts: { requestMs: 160_000, runMs: 170_000 },
    usage: {
        /** THE credit system (design D26): Tavily meters in its own API
         *  credits, priced per plan; the dollar conversion is the wallet
         *  rate card's job. */
        credits: { default: { label: "Tavily credits" } },
    },
    output: {
        /** Tavily's error envelope is `{detail: {error}}` (docs, 400-500
         *  examples). Vendor non-2xx is DATA - the engine zero-bills it. */
        fromError: ({ data, utils }) => {
            const message = utils.json.optionalGet(
                data.output,
                "$.detail.error",
            );
            return {
                message: typeof message === "string" && message !== ""
                    ? message
                    : "Tavily API error",
                raw: data.output,
            };
        },
    },
});
