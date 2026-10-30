import { z } from "zod";

/** GET /v2/industries query parameters. */
export const zSearchIndustriesQueryParams = z.object({
    search: z.string().describe(
        "Search applied to the industry name, e.g. 'saas'.",
    ).optional(),
    page: z.number().int().min(1).describe("Page to fetch (default 1).")
        .optional(),
    size: z.number().int().min(1).max(100).describe(
        "Industries per page, 1-100 (default 25).",
    ).optional(),
});
