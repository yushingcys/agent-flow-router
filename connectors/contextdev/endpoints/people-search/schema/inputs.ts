import { z } from "zod";

/** POST /people/search body - the vendor mirror
 *  (docs.context.dev/api-reference/people/search, 2026-10-27). `tags` is
 *  not carried. */
export const zPeopleSearchBody = z.object({
    query: z.string().min(1).max(500).describe(
        "Describe the people to find in plain words, by role, employer, " +
            "location, skills, or experience, e.g. 'Engineers at fintech " +
            "companies'.",
    ),
    filters: z.object({
        countries: z.array(z.string().regex(/^[A-Z]{2}$/)).describe(
            "Countries people live in as two-letter uppercase codes, such as " +
                "US or GB.",
        ).optional(),
        years_of_experience_min: z.number().int().min(0).describe(
            "Minimum years of professional experience.",
        ).optional(),
        years_of_experience_max: z.number().int().min(0).describe(
            "Maximum years of professional experience.",
        ).optional(),
    }).strict().describe("Additional constraints every result must match.")
        .optional(),
    cursor: z.string().max(65536).describe(
        "next_cursor from a previous page; send it with the SAME query and " +
            "filters to fetch the next page.",
    ).optional(),
}).strict();
