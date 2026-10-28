import { defineEndpoint } from "@shared/core";
import { zBrowserSessionBody } from "../../schema/common.ts";

/**
 * `POST https://api.browser.tinyfish.ai/` - rent a remote browser, the
 * tinyfish/browser-session resource's CREATES anchor. The call itself is
 * free; the session bills per minute through the resource until it is
 * released or times out.
 */
export default defineEndpoint({
    meta: {
        displayName: "Rent Remote Browser Session",
        summary: "Rent a remote browser to drive over CDP; billed per minute.",
        description: "Create a remote browser session and drive it " +
            "yourself over CDP - no AI: pass the returned cdp_url to " +
            "Playwright connectOverCDP (or any CDP client); base_url " +
            "serves session HTTP endpoints such as /pages. Billed per " +
            "minute of wall-clock session lifetime, idle time included; " +
            "the session also ends on its inactivity timeout " +
            "('timeout_seconds', capped at the plan maximum). Release it " +
            "with /browser-sessions/release as soon as you are done. For " +
            "AI-driven automation use /automation/run instead.",
        docsUrl: "https://docs.tinyfish.ai/browser-api/reference",
        categories: ["web-scraping"],
        notes: [
            "Running this SPENDS MONEY: $0.002 per minute until the " +
            "session is released or times out.",
            "cdp_url and base_url control the browser: whoever holds them " +
            "drives it.",
        ],
    },
    endpoint: "/browser-sessions/provision",
    request: { method: "POST", path: "/" },
    input: { schema: { body: zBrowserSessionBody } },
    resources: {
        provisions: [{
            id: "tinyfish/browser-session",
            seed: ({ data, utils }) => {
                const id = utils.json.optionalStr(data.output, "$.session_id");
                if (id === undefined) {
                    throw new Error(
                        "tinyfish returned success but no session_id",
                    );
                }
                return {
                    resource: "tinyfish/browser-session",
                    externalId: id,
                    identifier: id,
                    data: {},
                };
            },
        }],
    },
});
