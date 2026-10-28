import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGooglePlayAppsQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_play */
export default defineEndpoint({
    meta: {
        displayName: "Browse Android Apps",
        summary: "Search or browse Android apps on the Google Play Store.",
        description:
            "Search or browse Android apps on the Google Play Store. Runs SerpApi's `google_play` engine.",
        docsUrl: "https://serpapi.com/google-play-api",
        categories: ["app-stores"],
    },
    endpoint: "/google-play/apps",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGooglePlayAppsQuery.extend({
                engine: zEngine("google_play"),
            }),
        },
    },
});
