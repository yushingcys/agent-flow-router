import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zAppleAppStoreSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=apple_app_store */
export default defineEndpoint({
    meta: {
        displayName: "Search iOS Apps",
        summary: "Search the Apple App Store for iPhone, iPad, or Mac apps.",
        description:
            "Search the Apple App Store for iPhone, iPad, or Mac apps. Runs SerpApi's `apple_app_store` engine. Requires `term`.",
        docsUrl: "https://serpapi.com/apple-app-store",
        categories: ["app-stores"],
    },
    endpoint: "/apple-app-store/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zAppleAppStoreSearchQuery.extend({
                engine: zEngine("apple_app_store"),
            }),
        },
    },
});
