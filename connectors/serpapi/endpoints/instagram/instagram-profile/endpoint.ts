import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zInstagramProfileQuery } from "./schema/inputs.ts";

/** GET /search?engine=instagram_profile */
export default defineEndpoint({
    meta: {
        displayName: "Get Instagram Profile",
        summary: "Get a public Instagram profile's bio, counts, and posts.",
        description:
            "Get a public Instagram profile's bio, counts, and posts. Runs SerpApi's `instagram_profile` engine. Requires `profile_id`.",
        docsUrl: "https://serpapi.com/instagram-profile-api",
        categories: ["instagram"],
    },
    endpoint: "/instagram/profile",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zInstagramProfileQuery.extend({
                engine: zEngine("instagram_profile"),
            }),
        },
    },
});
