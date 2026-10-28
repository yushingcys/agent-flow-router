import { z } from "zod";

/** POST /v1/sessions body - docs.browserbase.com
 *  reference/api/create-a-session (read 2026-10-27). Optionality and vendor
 *  bounds only (D25). */
export const zBrowserbaseSessionCreateBody = z.looseObject({
    projectId: z.string().describe(
        "Project ID; inferred from the API key when omitted.",
    ).optional(),
    extensionId: z.string().describe("An uploaded extension's ID.")
        .optional(),
    browserSettings: z.looseObject({
        context: z.looseObject({
            id: z.string().describe("The context ID."),
            persist: z.boolean().describe(
                "Save the context's changes when the session ends (vendor " +
                    "default false).",
            ).optional(),
        }).describe(
            "Reuse cookies and storage saved in a Browserbase context.",
        ).optional(),
        extensionId: z.string().describe("An uploaded extension's ID.")
            .optional(),
        viewport: z.looseObject({
            width: z.number().int().optional(),
            height: z.number().int().optional(),
        }).describe("Browser viewport size in pixels.").optional(),
        blockAds: z.boolean().describe("Block ads (vendor default false).")
            .optional(),
        solveCaptchas: z.boolean().describe(
            "Solve captchas automatically (vendor default true).",
        ).optional(),
        recordSession: z.boolean().describe(
            "Record the session for replay (vendor default true).",
        ).optional(),
        logSession: z.boolean().describe(
            "Keep session logs (vendor default true).",
        ).optional(),
        verified: z.boolean().describe("Verified browser mode.").optional(),
        captchaImageSelector: z.string().describe(
            "Custom selector for the captcha image.",
        ).optional(),
        captchaInputSelector: z.string().describe(
            "Custom selector for the captcha input.",
        ).optional(),
        os: z.enum(["windows", "mac", "linux", "mobile", "tablet"]).describe(
            "Operating system to present in stealth mode.",
        ).optional(),
        allowedDomains: z.array(z.string()).describe(
            "Restrict main-frame navigation to these domains and their " +
                "subdomains; empty (the default) allows all.",
        ).optional(),
        ignoreCertificateErrors: z.boolean().describe(
            "Ignore TLS certificate errors (vendor default false).",
        ).optional(),
    }).optional(),
    timeout: z.number().int().min(60).max(21600).describe(
        "Seconds after which the session ends automatically (60-21600); " +
            "defaults to the project's defaultTimeout.",
    ).optional(),
    keepAlive: z.boolean().describe(
        "Keep the session running across disconnects until it times out or " +
            "is released.",
    ).optional(),
    proxies: z.union([z.boolean(), z.array(z.record(z.string(), z.unknown()))])
        .describe(
            "true for Browserbase's default proxy, or a list of proxy " +
                "configurations.",
        ).optional(),
    proxySettings: z.looseObject({
        caCertificates: z.array(z.string()).optional(),
    }).describe("Supplementary proxy settings.").optional(),
    region: z.enum(["us-west-2", "us-east-1", "eu-central-1", "ap-southeast-1"])
        .describe("Region to run the session in (vendor default us-west-2).")
        .optional(),
    userMetadata: z.record(z.string(), z.unknown()).describe(
        "Arbitrary metadata to tag the session with.",
    ).optional(),
});
