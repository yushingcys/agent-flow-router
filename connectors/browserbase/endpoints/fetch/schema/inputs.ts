import { z } from "zod";

/** POST /v1/fetch body - docs.browserbase.com reference/api/fetch-a-page
 *  (read 2026-10-27). Optionality and vendor bounds only (D25). */
export const zBrowserbaseFetchBody = z.looseObject({
    url: z.string().min(1).describe("The URL to fetch."),
    allowRedirects: z.boolean().describe(
        "Follow HTTP redirects (vendor default false).",
    ).optional(),
    allowInsecureSsl: z.boolean().describe(
        "Bypass TLS certificate verification (vendor default false).",
    ).optional(),
    proxies: z.boolean().describe(
        "Route the request through Browserbase's proxy network (vendor " +
            "default false).",
    ).optional(),
    format: z.enum(["raw", "json", "markdown"]).describe(
        "'raw' (vendor default) returns the body unchanged, 'markdown' " +
            "converts the page, 'json' extracts structured data per " +
            "`schema`.",
    ).optional(),
    schema: z.record(z.string(), z.unknown()).describe(
        "JSON Schema of the desired structure; only used with format " +
            "'json'.",
    ).optional(),
    contextId: z.string().describe(
        "ID of a Browserbase context whose persisted cookies are sent with " +
            "the request.",
    ).optional(),
});
