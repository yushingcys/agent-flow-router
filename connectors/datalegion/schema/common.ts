import { z } from "zod";

/** Output-shaping and match-filter knobs both enrich bodies share.
 *  `multiple_results` / `limit` are left out: multi-match is
 *  enterprise-only upstream (403 feature_not_available otherwise). */
export const zEnrichOptions = {
    min_confidence: z.enum(["high", "moderate", "low"]).describe(
        "Minimum match confidence; matches below it are filtered out.",
    ).optional(),
    titlecase: z.boolean().describe(
        "Format text fields (names, titles, companies, locations) in title case.",
    ).optional(),
    required_fields: z.string().max(1000).describe(
        "Fields a match must have, else it is filtered out and not billed: " +
            "'work_email', 'emails.type:personal', combined with AND / OR / " +
            "parentheses, e.g. '(work_email OR mobile_phone) AND job_title'.",
    ).optional(),
    include_fields: z.string().describe(
        "Comma-separated fields to include in the response (default: all the product covers).",
    ).optional(),
    exclude_fields: z.string().describe(
        "Comma-separated fields to exclude, applied after include_fields.",
    ).optional(),
};
