import { z } from "zod";
import { defineEndpoint } from "@shared/core";
import {
    AGENT_BASE_URL,
    zProfileId,
    zSetupSessionId,
} from "../../schema/common.ts";

/** `POST /v1/profiles/{profileId}/setup-session/cancel` - discard a setup
 *  session. Free. */
export default defineEndpoint({
    meta: {
        displayName: "Cancel Profile Login Session",
        summary: "Close a profile's setup browser without saving.",
        description: "Cancel a running setup session for a Browser " +
            "Context Profile: the temporary browser closes and unsaved " +
            "cookies and storage are discarded (anything already saved to " +
            "the profile is untouched). An expired or already-cancelled " +
            "session answers 409 or 404 - safe to ignore.",
        docsUrl:
            "https://docs.tinyfish.ai/api-reference/browser-context-profiles/cancel-a-profile-setup-session",
        categories: ["web-scraping"],
    },
    endpoint: "/browser-profiles/setup-cancel",
    request: {
        method: "POST",
        path: "/v1/profiles/{profileId}/setup-session/cancel",
        baseUrl: AGENT_BASE_URL,
    },
    input: {
        schema: {
            pathParams: z.object({ profileId: zProfileId }).strict(),
            body: z.object({ session_id: zSetupSessionId }).strict(),
        },
    },
});
