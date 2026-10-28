import { z } from "zod";

/**
 * Shared fragments for the TinyFish endpoint schemas (ported from the v1
 * adaptor's endpoints/common.ts).
 */

/**
 * `purpose` — a short statement of WHY the caller is searching or fetching.
 * TinyFish uses it as an extra ranking/extraction signal. Optional on both
 * endpoints; max 2000 chars, non-empty when present.
 */
export const zPurpose = z.string().min(1).max(2000).describe(
    "Optional short statement of the task these results are for — the goal " +
        "behind the request, not the request itself. TinyFish uses it as an " +
        "extra ranking signal. Example: 'Compare pricing tiers across " +
        "vendors for a procurement report'. Max 2000 characters.",
);

/** The Agent and Browser Context Profile APIs share one host. */
export const AGENT_BASE_URL = "https://agent.tinyfish.ai";

export const zProfileId = z.string().min(1).describe(
    "Browser Context Profile id (e.g. 'prof_abc123def4567890'), as " +
        "returned by /browser-profiles/provision.",
);

export const zSetupSessionId = z.string().min(1).describe(
    "The setup session's session_id, as returned by " +
        "/browser-profiles/setup-session.",
);

/** Session creation knobs shared by the remote Browser API and a profile's
 *  setup session (same vendor schema on both). */
export const zSessionUrl = z.string().describe(
    "URL the browser navigates to on startup. Bare domains (e.g. " +
        "'tinyfish.ai') are prefixed with https://. Omit to start at " +
        "about:blank.",
);

export const zSessionTimeoutSeconds = z.number().int().min(5).max(86_400)
    .nullable().describe(
        "Inactivity timeout in seconds (5-86400). Omitted, null, or above " +
            "your plan maximum means the plan maximum.",
    );

export const zBrowserSessionId = z.string().min(1).describe(
    "The remote browser's session_id, as returned by " +
        "/browser-sessions/provision.",
);

/** `POST https://api.browser.tinyfish.ai/` body - the remote Browser API
 *  (https://agent.tinyfish.ai/v1/openapi/browser, checked 2026-10-27). */
export const zBrowserSessionBody = z.object({
    url: zSessionUrl.optional(),
    timeout_seconds: zSessionTimeoutSeconds.optional(),
    proxy_config: z.object({
        enabled: z.boolean().optional().describe(
            "Route through a proxy (default true); false is direct egress.",
        ),
        type: z.enum(["tinyfish", "custom"]).optional().describe(
            "'tinyfish' (default): TinyFish residential proxy, one exit IP " +
                "per session. 'custom': your own proxy - requires url.",
        ),
        country_code: z.string().optional().describe(
            "TinyFish proxy exit country, ISO 3166-1 alpha-2 (default US).",
        ),
        url: z.url().optional().describe(
            "Your HTTP(S) proxy URL, when type is 'custom'.",
        ),
        username: z.string().optional(),
        password: z.string().optional(),
    }).strict().optional().describe(
        "Proxy for the session. Omit for the TinyFish proxy in the US.",
    ),
}).strict();
