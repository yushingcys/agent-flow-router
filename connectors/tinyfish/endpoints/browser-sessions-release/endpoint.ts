import { z } from "zod";
import { defineEndpoint } from "@shared/core";
import { zBrowserSessionId } from "../../schema/common.ts";

/**
 * `DELETE https://api.browser.tinyfish.ai/{sessionId}` - end a remote
 * browser now, the resource's RELEASES anchor. Unlike a renewable
 * resource, the teardown happens IN the run (the per-minute meter must
 * stop now, not at a period end); the settle mark then has the host
 * settle the final window. The resource's own `release` op stays safe to
 * run after it (the vendor DELETE is idempotent).
 */
export default defineEndpoint({
    meta: {
        displayName: "Release Remote Browser Session",
        summary: "End a remote browser session and stop its meter.",
        description: "Terminate a remote browser session you own and stop " +
            "its per-minute meter; its final usage window is settled. A " +
            "session that already ended on its own (inactivity timeout) " +
            "still releases cleanly.",
        docsUrl: "https://docs.tinyfish.ai/browser-api/reference",
        categories: ["web-scraping"],
    },
    endpoint: "/browser-sessions/release",
    request: { method: "DELETE", path: "/{sessionId}" },
    input: {
        schema: {
            pathParams: z.object({ sessionId: zBrowserSessionId }).strict(),
        },
    },
    resources: {
        releases: [{
            id: "tinyfish/browser-session",
            key: "$.pathParams.sessionId",
        }],
    },
});
