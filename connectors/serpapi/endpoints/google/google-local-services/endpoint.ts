import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleLocalServicesQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_local_services */
export default defineEndpoint({
    meta: {
        displayName: "Find Service Providers",
        summary:
            "List Google Local Services ads (verified pros) for a service and area.",
        description:
            "List Google Local Services ads (verified pros) for a service and area. Runs SerpApi's `google_local_services` engine. Requires `q`, `data_cid`.",
        docsUrl: "https://serpapi.com/google-local-services-api",
        categories: ["maps"],
    },
    endpoint: "/google/local-services",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleLocalServicesQuery.extend({
                engine: zEngine("google_local_services"),
            }),
        },
    },
});
