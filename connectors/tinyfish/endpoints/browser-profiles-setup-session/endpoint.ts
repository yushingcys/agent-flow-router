import { z } from "zod";
import { defineEndpoint } from "@shared/core";
import {
    AGENT_BASE_URL,
    zProfileId,
    zSessionTimeoutSeconds,
    zSessionUrl,
} from "../../schema/common.ts";

/** `POST /v1/profiles/{profileId}/setup-session` - a temporary setup
 *  browser to log in with. Free. */
export default defineEndpoint({
    meta: {
        displayName: "Start Profile Login Session",
        summary: "Open a temporary browser to log in for a profile.",
        description: "Start a temporary setup browser for a Browser " +
            "Context Profile: returns session_id, a cdp_url to drive with " +
            "Playwright or any CDP client (connectOverCDP), base_url for " +
            "session HTTP endpoints such as /pages, timeout_seconds, and " +
            "expires_at. Log into the target site over cdp_url, then " +
            "persist the cookies and storage with " +
            "/browser-profiles/setup-save (pass this session_id), or " +
            "discard with /browser-profiles/setup-cancel. Unsaved state " +
            "is discarded at expires_at.",
        docsUrl:
            "https://docs.tinyfish.ai/api-reference/browser-context-profiles/create-a-profile-setup-session",
        categories: ["web-scraping"],
        notes: [
            "cdp_url and base_url control the browser: whoever holds them " +
            "drives it until it expires.",
        ],
    },
    endpoint: "/browser-profiles/setup-session",
    request: {
        method: "POST",
        path: "/v1/profiles/{profileId}/setup-session",
        baseUrl: AGENT_BASE_URL,
    },
    input: {
        schema: {
            pathParams: z.object({ profileId: zProfileId }).strict(),
            body: z.object({
                url: zSessionUrl.optional(),
                timeout_seconds: zSessionTimeoutSeconds.optional(),
            }).strict(),
        },
    },
});
