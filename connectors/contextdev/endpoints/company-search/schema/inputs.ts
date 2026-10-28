import { z } from "zod";

/** POST /company/search body - the vendor mirror
 *  (docs.context.dev/api-reference/company/search, 2026-10-27). `tags` is
 *  not carried. */
export const zCompanySearchBody = z.object({
    query: z.string().min(1).max(500).describe(
        "Describe the companies to find in plain words, e.g. 'Robotics " +
            "companies with 50-200 employees' or 'companies like stripe.com'.",
    ),
    filters: z.object({
        countries: z.array(z.string().regex(/^[A-Z]{2}$/)).describe(
            "Headquarters countries as two-letter uppercase codes, such as " +
                "US or GB.",
        ).optional(),
        employees_min: z.number().int().min(0).describe(
            "Minimum headcount; includes overlapping employee ranges.",
        ).optional(),
        employees_max: z.number().int().min(0).describe(
            "Maximum headcount; includes overlapping employee ranges.",
        ).optional(),
    }).strict().describe("Additional constraints every result must match.")
        .optional(),
    cursor: z.string().max(64).describe(
        "next_cursor from a previous page; send it with the SAME query and " +
            "filters to fetch the next page.",
    ).optional(),
}).strict();
