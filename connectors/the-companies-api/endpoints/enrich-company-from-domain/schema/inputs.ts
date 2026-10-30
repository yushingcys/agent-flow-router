import { z } from "zod";

/** GET /v2/companies/{domain} path parameters. */
export const zEnrichPathParams = z.object({
    domain: z.string().min(1).describe("Company domain, e.g. microsoft.com."),
});

/** GET /v2/companies/{domain} query parameters. */
export const zEnrichQueryParams = z.object({
    simplified: z.boolean().describe(
        "Return the simplified record instead; free, no credits drawn.",
    ).optional(),
    refresh: z.boolean().describe(
        "Re-crawl and re-enrich the company in real time; costs 10 extra credits.",
    ).optional(),
});
