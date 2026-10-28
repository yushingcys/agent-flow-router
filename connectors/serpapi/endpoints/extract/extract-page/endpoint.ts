import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zExtractPageQuery } from "./schema/inputs.ts";

/** GET /search?engine=extract */
export default defineEndpoint({
    meta: {
        displayName: "Scrape Structured Page",
        summary:
            "Extract structured content and metadata from one public web page.",
        description:
            "Extract structured content and metadata from one public web page. Runs SerpApi's `extract` engine. Requires `url`.",
        docsUrl: "https://serpapi.com/extract-api",
        categories: ["web-extraction"],
    },
    endpoint: "/extract/page",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zExtractPageQuery.extend({
                engine: zEngine("extract"),
            }),
        },
    },
});
