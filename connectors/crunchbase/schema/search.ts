import { z } from "zod";

/** `Predicate` (OpenAPI components): one search criterion. */
export const zPredicate = z.object({
    type: z.literal("predicate").describe("Always 'predicate'.").optional(),
    field_id: z.string().describe(
        "The field to filter on, e.g. 'categories', 'location_identifiers', 'funding_total', 'investor_type'.",
    ),
    operator_id: z.enum([
        "blank",
        "eq",
        "not_eq",
        "gt",
        "gte",
        "lt",
        "lte",
        "starts",
        "contains",
        "not_contains",
        "between",
        "includes",
        "not_includes",
        "includes_all",
        "not_includes_all",
        "domain_eq",
        "not_domain_eq",
        "domain_blank",
        "domain_includes",
        "not_domain_includes",
    ]).describe(
        "Comparison: eq, gt/gte/lt/lte, between (two values), contains, starts, includes / includes_all (any / all of the values), blank, domain_eq ...",
    ),
    values: z.array(z.union([z.string(), z.number(), z.boolean()])).max(200)
        .describe(
            "Values matching the field's type; entity fields take UUIDs or permalinks, money fields {value, currency} as documented.",
        ).optional(),
});

/** `EntitySearch` (OpenAPI components): the POST search body. */
export const zEntitySearchBody = z.object({
    field_ids: z.array(z.string()).describe(
        "Fields to return per entity, e.g. ['identifier', 'short_description', 'website_url', 'rank_org'].",
    ),
    query: z.array(zPredicate).max(25).describe(
        "Up to 25 predicates, all of which must match.",
    ),
    order: z.array(z.object({
        field_id: z.string().describe("Field to sort on."),
        sort: z.enum(["asc", "desc"]).describe("Sort direction."),
        nulls: z.enum(["first", "last"]).describe("Where nulls sort.")
            .optional(),
    })).describe("Sort order of the results.").optional(),
    limit: z.number().int().min(1).max(1000).describe(
        "Rows to return, 1-1000 (default 100).",
    ).optional(),
    after_id: z.string().uuid().describe(
        "UUID of the last entity of the previous page (next page).",
    ).optional(),
    before_id: z.string().uuid().describe(
        "UUID of the first entity of the current page (previous page).",
    ).optional(),
});
