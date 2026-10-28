import { z } from "zod";
import { defineEndpoint } from "@shared/core";
import {
    AGENT_BASE_URL,
    zProfileId,
    zSetupSessionId,
} from "../../schema/common.ts";

/** `POST /v1/profiles/{profileId}/save` - capture a setup session's login
 *  state into the profile. Free. */
export default defineEndpoint({
    meta: {
        displayName: "Save Profile Login Session",
        summary: "Save a setup session's cookies and storage to a profile.",
        description: "Capture the cookies, local storage, and session " +
            "storage from a running setup session into its Browser " +
            "Context Profile. Returns the save summary: domains_updated, " +
            "domains_failed, cookie_count, pages_captured, and per-kind " +
            "skip buckets. Call before the setup session's expires_at - " +
            "an expired or cancelled session answers 409 and nothing is " +
            "saved.",
        docsUrl:
            "https://docs.tinyfish.ai/api-reference/browser-context-profiles/save-a-profile-setup-session",
        categories: ["web-scraping"],
    },
    endpoint: "/browser-profiles/setup-save",
    request: {
        method: "POST",
        path: "/v1/profiles/{profileId}/save",
        baseUrl: AGENT_BASE_URL,
    },
    input: {
        schema: {
            pathParams: z.object({ profileId: zProfileId }).strict(),
            body: z.object({
                session_id: zSetupSessionId,
                signed_in_sites: z.array(z.string().max(253)).max(20)
                    .optional().describe(
                        "Sites you signed into during setup, as hosts or " +
                            "URLs; each is recorded as signed in only if " +
                            "this save wrote its cookies.",
                    ),
            }).strict(),
        },
    },
});
