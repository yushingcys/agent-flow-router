import { z } from "zod";

/**
 * TinyFish Agent run body - mirrors `POST /v1/automation/run-async`
 * (https://agent.tinyfish.ai/v1/openapi/main, checked 2026-10-27).
 * `api_integration` (vendor analytics tag) is left out: it describes the
 * caller of the vendor, which is always this connector.
 */
export const zAutomationRunBody = z.object({
    url: z.url().describe("Website URL the agent starts on."),
    goal: z.string().min(1).describe(
        "Natural-language description of what to accomplish on the site, " +
            "e.g. 'Find the pricing page and extract all plan details'.",
    ),
    browser_profile: z.enum(["lite", "stealth"]).optional().describe(
        "'lite' (standard browser, default) or 'stealth' (anti-detection " +
            "browser for protected sites; pair with proxy_config).",
    ),
    agent_config: z.object({
        mode: z.enum(["default", "strict"]).optional().describe(
            "'strict' fails fast (test automation).",
        ),
        cursor_style: z.enum(["fish", "standard", "green-pointer"])
            .optional(),
        max_steps: z.number().int().min(1).max(500).optional().describe(
            "Maximum agent steps before the run stops with partial " +
                "results (default 150). Bounds the cost. Beta-gated by " +
                "TinyFish: accounts without the beta get 403 FORBIDDEN " +
                "when this is set.",
        ),
        max_duration_seconds: z.number().int().min(1).optional().describe(
            "Soft wall-clock budget in seconds (default: no limit).",
        ),
    }).strict().optional(),
    capture_config: z.object({
        elements: z.boolean().optional(),
        snapshots: z.boolean().optional(),
        screenshots: z.boolean().optional(),
        recording: z.boolean().optional(),
        html: z.boolean().optional(),
    }).strict().optional().describe(
        "Which artifacts to capture per step (screenshots, HTML " +
            "snapshots, a video recording, ...).",
    ),
    webhook_url: z.url({ protocol: /^https$/ }).optional().describe(
        "HTTPS URL notified on run lifecycle events.",
    ),
    use_vault: z.boolean().optional().describe(
        "Let the run use the account's connected password-manager " +
            "credentials (default false).",
    ),
    use_profile: z.boolean().optional().describe(
        "Attach a Browser Context Profile (saved login state): the one in " +
            "profile_id, else the account default. 400 when no default " +
            "profile is set.",
    ),
    profile_id: z.string().min(1).optional().describe(
        "Browser Context Profile id to attach when use_profile is true " +
            "(from /browser-profiles/provision).",
    ),
    credential_item_ids: z.array(z.string().min(1)).min(1).optional()
        .describe(
            "Scope vault credentials to these credential URIs. Requires " +
                "use_vault.",
        ),
    proxy_config: z.object({
        enabled: z.boolean(),
        country_code: z.string().optional().describe(
            "Exit country, ISO 3166-1 alpha-2 (default US).",
        ),
    }).strict().optional(),
    output_schema: z.record(z.string(), z.unknown()).optional().describe(
        "JSON Schema (provider-supported subset) the run's 'result' must " +
            "follow. Unsupported fields are rejected up front.",
    ),
}).strict();
