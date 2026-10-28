import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGooglePlayMoviesQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_play_movies */
export default defineEndpoint({
    meta: {
        displayName: "Browse Movies and TV",
        summary: "Search or browse movies and TV shows on Google Play.",
        description:
            "Search or browse movies and TV shows on Google Play. Runs SerpApi's `google_play_movies` engine.",
        docsUrl: "https://serpapi.com/google-play-movies",
        categories: ["app-stores"],
    },
    endpoint: "/google-play/movies",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGooglePlayMoviesQuery.extend({
                engine: zEngine("google_play_movies"),
            }),
        },
    },
});
