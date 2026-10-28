import { z } from "zod";

/** Akta /v1/list/generate/companies JSON body. */
export const zListGenerateBody = z.object({
    filters: z.record(z.string(), z.unknown()).describe(
        "Structured filter conditions, keyed by filter field (e.g. " +
            "'firmographic.company_type': ['private'], " +
            "'firmographic.founded_year': {'gte': 2015, 'lte': 2022}). " +
            "All conditions combine with AND. Get the accepted keys and " +
            "value shapes from the Akta Filters List endpoint and allowed " +
            "values from the Akta Filter Options endpoint.",
    ),
    sort_by: z.enum([
        "relevance",
        "revenue_estimate",
        "valuation_estimate",
        "employee_range",
        "total_funding",
        "founded_year",
    ]).optional().describe("Field to sort results by. Default relevance."),
    sort_order: z.enum(["asc", "desc"]).optional().describe(
        "Sort direction. Default desc.",
    ),
    limit: z.number().int().min(1).max(500).optional().describe(
        "Maximum number of companies to return. Default 50, max 500.",
    ),
    offset: z.number().int().min(0).optional().describe(
        "Number of results to skip before returning records (pagination).",
    ),
}).strict();
