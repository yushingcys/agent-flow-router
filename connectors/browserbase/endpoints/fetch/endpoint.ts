import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zBrowserbaseFetchBody } from "./schema/inputs.ts";

/** POST /v1/fetch - one page without a browser. $0.01 per call (gateway
 *  card, see provider.ts). */
export default defineEndpoint({
    meta: {
        displayName: "Browserbase Fetch",
        summary: "Fetch a page and return content, headers and metadata.",
        description: "Retrieve one URL without starting a browser and get " +
            "back the target's HTTP status, response headers, content type, " +
            "encoding and body - unchanged, converted to markdown, or " +
            "extracted to JSON against a schema you pass. Optionally follow " +
            "redirects, skip TLS verification, route through Browserbase " +
            "proxies, or send a saved context's cookies for authenticated " +
            "pages. Does not run JavaScript; use a browser session for " +
            "pages that render client-side. Costs $0.01 per call.",
        docsUrl: "https://docs.browserbase.com/reference/api/fetch-a-page",
        categories: ["web-scraping"],
        notes: [
            "`statusCode` is the TARGET's status: a 200 run can carry a 404 " +
            "page.",
        ],
    },
    endpoint: "/fetch",
    request: { method: "POST", path: "/v1/fetch" },
    input: { schema: { body: zBrowserbaseFetchBody } },
    usage: {
        model: {
            kind: UsageModelKind.PER_CALL,
            label: "fetch",
            consumes: { credit: "default", amount: 0.01 },
        },
    },
});
