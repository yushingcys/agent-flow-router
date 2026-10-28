import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleSportsQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_sports */
export default defineEndpoint({
    meta: {
        displayName: "Get Sports Results",
        summary:
            "Get scores, fixtures, standings, and players for a league, team, or game.",
        description:
            "Get scores, fixtures, standings, and players for a league, team, or game. Runs SerpApi's `google_sports` engine. Requires `kgmid`, `sp`, `type`.",
        docsUrl: "https://serpapi.com/google-sports-api",
        categories: ["web-search"],
    },
    endpoint: "/google/sports",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleSportsQuery.extend({
                engine: zEngine("google_sports"),
            }),
        },
    },
});
