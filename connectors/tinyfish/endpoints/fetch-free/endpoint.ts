import { defineEndpoint } from "@shared/core";
import { fetchDef } from "../fetch/endpoint.ts";

/**
 * TinyFish Fetch, free tier - the SAME vendor call as tinyfish#fetch under
 * a second public id. The vendor bills neither; the two ids exist because
 * the hosted catalog sells them at different prices and rate limits (the
 * free one draws on the workspace's free quota).
 */
export default defineEndpoint({
    ...fetchDef,
    meta: {
        ...fetchDef.meta,
        displayName: "TinyFish Fetch (free)",
        summary:
            "Fetch up to 10 URLs as clean Markdown/HTML/JSON - free, lower rate limit.",
    },
    endpoint: "/free/fetch",
});
