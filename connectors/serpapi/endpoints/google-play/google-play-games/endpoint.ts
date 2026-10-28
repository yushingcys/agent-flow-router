import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGooglePlayGamesQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_play_games */
export default defineEndpoint({
    meta: {
        displayName: "Browse Mobile Games",
        summary: "Search or browse games on the Google Play Store.",
        description:
            "Search or browse games on the Google Play Store. Runs SerpApi's `google_play_games` engine.",
        docsUrl: "https://serpapi.com/google-play-games",
        categories: ["app-stores"],
    },
    endpoint: "/google-play/games",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGooglePlayGamesQuery.extend({
                engine: zEngine("google_play_games"),
            }),
        },
    },
});
