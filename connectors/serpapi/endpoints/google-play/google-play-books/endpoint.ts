import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGooglePlayBooksQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_play_books */
export default defineEndpoint({
    meta: {
        displayName: "Browse Ebooks",
        summary: "Search or browse ebooks and audiobooks on Google Play Books.",
        description:
            "Search or browse ebooks and audiobooks on Google Play Books. Runs SerpApi's `google_play_books` engine.",
        docsUrl: "https://serpapi.com/google-play-books",
        categories: ["app-stores"],
    },
    endpoint: "/google-play/books",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGooglePlayBooksQuery.extend({
                engine: zEngine("google_play_books"),
            }),
        },
    },
});
