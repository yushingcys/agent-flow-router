import { z } from "zod";
import { defineEndpoint } from "@shared/core";
import { AGENT_BASE_URL } from "../../schema/common.ts";

/** `POST /v1/profiles` - create a Browser Context Profile. Free. */
export default defineEndpoint({
    meta: {
        displayName: "Create Browser Profile",
        summary: "Create a Browser Context Profile for saved logins.",
        description: "Create a Browser Context Profile: named, persistent " +
            "login state for /automation/run. Flow: (1) create it here, " +
            "(2) open a setup browser with /browser-profiles/setup-session " +
            "and log in over its cdp_url with Playwright or any CDP " +
            "client, (3) save it with /browser-profiles/setup-save, (4) " +
            "pass 'use_profile' and 'profile_id' to /automation/run - the " +
            "agent starts signed in. Free to create and hold; optionally " +
            "pin a proxy exit country. Delete with " +
            "/browser-profiles/release.",
        docsUrl: "https://docs.tinyfish.ai/agent-api/browser-context-profiles",
        categories: ["web-scraping"],
    },
    endpoint: "/browser-profiles/provision",
    request: { method: "POST", path: "/v1/profiles", baseUrl: AGENT_BASE_URL },
    input: {
        schema: {
            body: z.object({
                name: z.string().min(1).max(100).describe(
                    "Display name, e.g. 'Work Gmail'.",
                ),
                set_as_default: z.boolean().optional().describe(
                    "Make this the account's default profile (used by " +
                        "runs that set use_profile without profile_id).",
                ),
                proxy_country_code: z.string().nullable().optional()
                    .describe(
                        "Pin the profile's proxy exit country (ISO 3166-1 " +
                            "alpha-2).",
                    ),
            }).strict(),
        },
    },
});
