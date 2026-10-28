import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zBrowserbaseSearchBody } from "./schema/inputs.ts";

/** POST /v1/search - structured web search. $0.01 per call in every
 *  provider and mode (gateway card, see provider.ts). */
export default defineEndpoint({
    meta: {
        displayName: "Browserbase Search",
        summary: "Web search with structured results.",
        description: "Run a web search and get up to 25 structured results, " +
            "each with URL, title, author, publish date, image and favicon. " +
            "Choose the provider (parallel or exa) and its mode, from fast " +
            "lookups to exa's deep search. Pair with Fetch or a browser " +
            "session to read the pages it finds. Costs $0.01 per call.",
        docsUrl: "https://docs.browserbase.com/reference/api/web-search",
        categories: ["web-search"],
    },
    endpoint: "/search",
    request: { method: "POST", path: "/v1/search" },
    input: { schema: { body: zBrowserbaseSearchBody } },
    usage: {
        model: {
            kind: UsageModelKind.PER_CALL,
            label: "search",
            consumes: { credit: "default", amount: 0.01 },
        },
    },
});
