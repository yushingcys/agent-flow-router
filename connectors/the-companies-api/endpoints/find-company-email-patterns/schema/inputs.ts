import { z } from "zod";

/** GET /v2/companies/{domain}/email-patterns path parameters. */
export const zEmailPatternsPathParams = z.object({
    domain: z.string().min(1).describe("Company domain, e.g. apple.com."),
});

/** GET /v2/companies/{domain}/email-patterns query parameters. */
export const zEmailPatternsQueryParams = z.object({
    emailsCount: z.boolean().describe(
        "Include the number of observed emails per pattern.",
    ).optional(),
    precision: z.number().min(0).max(100).describe(
        "Minimum usage percentage a pattern must reach, 0-100.",
    ).optional(),
});
