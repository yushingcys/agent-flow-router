import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zOpentableReviewsQuery } from "./schema/inputs.ts";

/** GET /search?engine=open_table_reviews */
export default defineEndpoint({
    meta: {
        displayName: "Read Restaurant Reviews",
        summary: "Get diner reviews of one OpenTable restaurant.",
        description:
            "Get diner reviews of one OpenTable restaurant. Runs SerpApi's `open_table_reviews` engine. Requires `rid`.",
        docsUrl: "https://serpapi.com/open-table-reviews-api",
        categories: ["maps", "company-reviews"],
    },
    endpoint: "/opentable/reviews",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zOpentableReviewsQuery.extend({
                engine: zEngine("open_table_reviews"),
            }),
        },
    },
});
