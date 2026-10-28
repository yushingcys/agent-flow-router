import { z } from "zod";
import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zExtractMapQuery } from "./schema/inputs.ts";

/** GET /search?engine=extract */
export default defineEndpoint({
    meta: {
        displayName: "Map Website Links",
        summary: "List a website's URLs from its links and sitemaps.",
        description:
            "List a website's URLs from its links and sitemaps. Runs SerpApi's `extract` engine in `map` mode. Requires `url`.",
        docsUrl: "https://serpapi.com/extract-map-mode",
        categories: ["web-extraction"],
    },
    endpoint: "/extract/map",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zExtractMapQuery.extend({
                engine: zEngine("extract"),
                mode: z.literal("map").default("map").describe(
                    "Extract mode. Fixed to map for this endpoint.",
                ),
            }),
        },
    },
});
