import { defineEndpoint } from "@shared/core";
import { searchDef } from "../search/endpoint.ts";

/**
 * TinyFish Web Search, free tier - the SAME vendor call as tinyfish#search
 * under a second public id (see tinyfish#free/fetch for why).
 */
export default defineEndpoint({
    ...searchDef,
    meta: {
        ...searchDef.meta,
        displayName: "TinyFish Web Search (free)",
        summary:
            "Search the live web, news, or research papers - free, lower rate limit.",
    },
    endpoint: "/free/search",
});
