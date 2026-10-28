import { z } from "zod";
import { defineEndpoint } from "@shared/core";
import { AGENT_BASE_URL, zProfileId } from "../../schema/common.ts";

/** `DELETE /v1/profiles/{profileId}` - delete a Browser Context Profile. */
export default defineEndpoint({
    meta: {
        displayName: "Delete Browser Profile",
        summary: "Delete a Browser Context Profile and its saved logins.",
        description: "Delete a Browser Context Profile: its saved cookies " +
            "and storage are discarded and runs can no longer attach it. " +
            "Immediate and free.",
        docsUrl: "https://docs.tinyfish.ai/agent-api/browser-context-profiles",
        categories: ["web-scraping"],
    },
    endpoint: "/browser-profiles/release",
    request: {
        method: "DELETE",
        path: "/v1/profiles/{profileId}",
        baseUrl: AGENT_BASE_URL,
    },
    input: {
        schema: { pathParams: z.object({ profileId: zProfileId }).strict() },
    },
});
