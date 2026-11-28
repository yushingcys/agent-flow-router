import { defineEndpoint } from "@shared/core";
import { zFindActiveListingsQuery } from "./schema/inputs.ts";

/** GET /v3/application/listings/active - findAllListingsActive. */
export default defineEndpoint({
    meta: {
        displayName: "Search Active Listings",
        summary: "Search active Etsy listings by keyword and price.",
        description: "Find active Etsy listings whose text contains all " +
            "the keywords, optionally within a price range, taxonomy, " +
            "shop location or ships-to country, sorted by relevance, " +
            "price, or recency. Returns `{count, results}` with each " +
            "listing's id, title, description, price, quantity, tags, " +
            "shop id and URL.",
        docsUrl:
            "https://developers.etsy.com/documentation/reference#operation/findAllListingsActive",
        notes: [
            "sort_on and sort_order only apply when a search option such " +
            "as keywords is set; without one, newest listings come first.",
        ],
    },
    request: { method: "GET", path: "/listings/active" },
    input: { schema: { queryParams: zFindActiveListingsQuery } },
});
