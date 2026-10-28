import { defineProvider, UsageModelKind } from "@shared/core";

/**
 * SerpApi (serpapi.com) - parsed results pages from Google, Bing,
 * DuckDuckGo, Yahoo, Yandex, Baidu, Naver, Brave, Amazon, Walmart, eBay,
 * The Home Depot, Target, YouTube, Airbnb, Tripadvisor, Yelp, OpenTable,
 * Zillow, the app stores, and more, plus its own Extract and Search Index
 * APIs.
 *
 * ONE wire call for almost everything: `GET https://serpapi.com/search`
 * with an `engine` query parameter choosing the backend. Each endpoint
 * here is one engine (or one engine in one mode), so the public identity
 * is Monid's `<platform>/<name>` path (`endpoint`), and the engine rides
 * as a fixed `engine` query parameter bound in each endpoint.ts
 * (`zEngine`). Auth is the `api_key` QUERY parameter - SerpApi documents
 * no header form - so `deno task record` would keep the key in the
 * recorded request URL: scrub it by hand before committing a recording.
 *
 * Rate card: SerpApi meters "searches" - one per successful call, cached
 * and errored searches free; Extract crawl mode bills one per extracted
 * page. One pool `default`, PER_CALL 1; the crawl endpoint overrides with
 * PER_UNIT RESULT. Monid sells every endpoint here at $0.015 a search
 * (monid.ai/tools/serpapi, read 2026-10-27).
 *
 * Not exposed: `async` (submit-then-poll through the Searches Archive
 * API), `output` (html / md bodies instead of JSON), and the engines
 * Monid does not list.
 */
export default defineProvider({
    name: "serpapi",
    meta: {
        displayName: "SerpApi",
        summary: "Parsed search results from Google, Bing, marketplaces, " +
            "maps, travel, and app stores as JSON.",
        description: "Run a search on Google (web, AI Mode, AI Overview, " +
            "Maps, Flights, Hotels, Jobs, Scholar, Patents, Trends, " +
            "Finance, News, Images, Lens, Shopping, Play), Bing, " +
            "DuckDuckGo, Yahoo, Yandex, Baidu, Naver, or Brave, or on " +
            "Amazon, Walmart, eBay, The Home Depot, Target, YouTube, " +
            "Airbnb, Tripadvisor, Yelp, OpenTable, Zillow, the App Store, " +
            "Facebook, or Instagram, and get every element of the results " +
            "page parsed into JSON. Also extracts, maps, and crawls public " +
            "web pages.",
        homepageUrl: "https://serpapi.com",
        docsUrl: "https://serpapi.com/search-api",
        categories: ["web-search"],
        notes: [
            "Most engines take a `location` string; resolve a place name " +
            "to the exact accepted form with serpapi#locations (free).",
            "Pagination tokens (`next_page_token`, `page_token`, " +
            "`subsequent_request_token`, ...) come from a previous " +
            "response of the same engine.",
        ],
    },
    auth: {
        inject: ({ data }) => ({
            ...data.request,
            query: { ...data.request.query, api_key: [data.params.apiKey] },
        }),
    },
    request: { baseUrl: "https://serpapi.com" },
    // Live searches routinely take 5-20 s; deep flight searches and the AI
    // engines can run past a minute.
    timeouts: { requestMs: 120_000, runMs: 120_000 },
    usage: {
        credits: { default: { label: "SerpApi searches" } },
        model: {
            kind: UsageModelKind.PER_CALL,
            label: "search",
            consumes: { credit: "default", amount: 1 },
        },
    },
    output: {
        /** SerpApi error envelope: `{"error": "Invalid API key. ..."}`. */
        fromError: ({ data, utils }) => {
            const error = utils.json.optionalGet(data.output, "$.error");
            return {
                message: typeof error === "string" && error !== ""
                    ? error
                    : "SerpApi error",
                raw: data.output,
            };
        },
    },
});
