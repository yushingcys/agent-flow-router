import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zFacebookProfileQuery } from "./schema/inputs.ts";

/** GET /search?engine=facebook_profile */
export default defineEndpoint({
    meta: {
        displayName: "Get Facebook Page",
        summary: "Get a public Facebook profile or page's details.",
        description:
            "Get a public Facebook profile or page's details. Runs SerpApi's `facebook_profile` engine. Requires `profile_id`.",
        docsUrl: "https://serpapi.com/facebook-profile-api",
        categories: ["facebook"],
    },
    endpoint: "/facebook/profile",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zFacebookProfileQuery.extend({
                engine: zEngine("facebook_profile"),
            }),
        },
    },
});
