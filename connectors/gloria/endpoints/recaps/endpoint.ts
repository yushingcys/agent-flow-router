import { defineEndpoint } from "@shared/core";
import { zRecapsQuery } from "./schema/inputs.ts";

/** GET /recaps - the latest AI recap of a category. */
export default defineEndpoint({
    meta: {
        displayName: "Category News Recap",
        summary: "AI recap of the most significant news in a category " +
            "over the past 12-24 hours.",
        description: "Get the latest AI-written recap of the most " +
            "significant news in a feed category (crypto, macro, " +
            "bitcoin, defi, ...) over its 12 or 24 hour window, with " +
            "the time it was generated.",
        docsUrl:
            "https://github.com/cryptobriefing/gloria-docs/blob/main/docs/gloria-data-platform/api-integration.md#recaps-api",
        categories: ["news-search", "crypto-signals"],
    },
    endpoint: "/recaps",
    request: { method: "GET", path: "/recaps" },
    input: {
        schema: { queryParams: zRecapsQuery },
        /** Fill the category's own window (api-integration.md, "Recap
         *  Timeframes by Category") when the caller omits it. */
        toRequest: ({ data }) => {
            const query = data.input.queryParams ?? {};
            const twelve = [
                "ai",
                "ai_agents",
                "crypto",
                "defi",
                "machine_learning",
                "macro",
                "tech",
                "virtuals",
            ];
            return {
                ...data.input,
                queryParams: {
                    ...query,
                    timeframe: query.timeframe ??
                        (twelve.includes(String(query.feed_category))
                            ? "12h"
                            : "24h"),
                },
            };
        },
    },
});
