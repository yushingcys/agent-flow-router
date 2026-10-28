import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleEventsQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_events */
export default defineEndpoint({
    meta: {
        displayName: "Find Local Events",
        summary:
            "Find upcoming events for a query and place from Google Events.",
        description:
            "Find upcoming events for a query and place from Google Events. Runs SerpApi's `google_events` engine. Requires `q`.",
        docsUrl: "https://serpapi.com/google-events-api",
        categories: ["events"],
    },
    endpoint: "/google/events",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleEventsQuery.extend({
                engine: zEngine("google_events"),
            }),
        },
    },
});
