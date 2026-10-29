import { z } from "zod";
import { zQuery, zSearchFields } from "../../../schema/segmentation.ts";

const zSortKey = z.enum([
    "about.businessType",
    "about.industries",
    "about.industry",
    "about.name",
    "about.totalEmployees",
    "about.yearFounded",
    "analytics.monthlyVisitors",
    "apps",
    "codes.naics",
    "codes.sic",
    "contacts",
    "domain.domain",
    "domain.tld",
    "finances.revenue",
    "locations.headquarters.city.code",
    "locations.headquarters.country.code",
    "locations.headquarters.county.code",
    "locations.headquarters.state.code",
    "meta.score",
    "meta.syncedAt",
    "socials",
    "technologies.active",
    "urls",
]);

/** POST /v2/companies body. */
export const zSearchCompaniesBody = z.object({
    query: zQuery.optional(),
    search: z.string().describe(
        "Free-text search on the company name or domain.",
    ).optional(),
    searchFields: zSearchFields.optional(),
    domainsToExclude: z.string().describe(
        "Comma-separated domains to exclude, e.g. 'amazon.com,pearson.com'.",
    ).optional(),
    linkedinToExclude: z.string().describe(
        "Comma-separated LinkedIn company URLs to exclude.",
    ).optional(),
    page: z.number().int().min(1).describe("Page to fetch (default 1).")
        .optional(),
    size: z.number().int().min(1).max(100).describe(
        "Companies per page, 1-100 (default 10); each full record costs 1 credit.",
    ).optional(),
    simplified: z.boolean().describe(
        "Return simplified records for free (preview before paying).",
    ).optional(),
    sortKey: zSortKey.describe("Field to sort by.").optional(),
    sortOrder: z.enum(["asc", "desc"]).describe("Sort order.").optional(),
    sortFields: z.array(z.object({
        key: zSortKey,
        order: z.enum(["asc", "desc"]),
        missing: z.enum(["_first", "_last"]).optional(),
    })).describe("Several sort fields combined, applied in order.")
        .optional(),
    actionId: z.number().int().describe(
        "Read the companies of a previously requested action.",
    ).optional(),
});
