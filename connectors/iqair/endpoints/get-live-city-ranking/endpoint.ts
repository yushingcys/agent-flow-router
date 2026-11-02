import { defineEndpoint } from "@shared/core";
import { zCityRankingQuery } from "./schema/inputs.ts";

/** GET /v2/city_ranking - major world cities ranked by current AQI. */
export default defineEndpoint({
    meta: {
        displayName: "Get Live City Ranking",
        summary: "Major world cities ranked by current AQI, highest first.",
        description: "List IQAir's selected major cities worldwide, " +
            "sorted from highest to lowest current AQI, each with its " +
            "city, state, country, current US and China AQI, and the " +
            "previous reading when available.",
        docsUrl: "https://api-docs.iqair.com",
        notes: [
            "Enterprise plan only: other keys get a feature_not_available " +
            "error.",
        ],
    },
    endpoint: "/get_live_city_ranking",
    request: { method: "GET", path: "/city_ranking" },
    input: { schema: { queryParams: zCityRankingQuery } },
});
