import { z } from "zod";

/** `SegmentationCondition` (OpenAPI components): one filter of the
 *  segmentation engine shared by search and count. */
export const zSegmentationCondition = z.object({
    attribute: z.enum([
        "about.businessType",
        "about.industries",
        "about.industry",
        "about.name",
        "about.totalEmployees",
        "about.yearFounded",
        "ai.search",
        "analytics.monthlyVisitors",
        "apps",
        "codes.naics",
        "codes.sic",
        "contacts",
        "domain.domain",
        "domain.tld",
        "finances.revenue",
        "finances.stockExchange",
        "locations.headquarters.city.code",
        "locations.headquarters.continent.code",
        "locations.headquarters.country.code",
        "locations.headquarters.county.code",
        "locations.headquarters.state.code",
        "meta.listIds",
        "meta.score",
        "meta.syncedAt",
        "socials",
        "socials.linkedin.id",
        "technologies.active",
        "technologies.categories",
        "urls",
    ]).describe("The company attribute to filter on."),
    operator: z.enum(["and", "or"]).describe(
        "How the values combine: 'or' matches any value, 'and' all of them.",
    ),
    sign: z.enum(["equals", "exactEquals", "greater", "lower", "notEquals"])
        .describe("The comparison applied to each value."),
    values: z.array(z.union([z.string(), z.number()])).describe(
        "Values to compare, e.g. industry slugs ['computer-software'] or lowercase ISO country codes ['us', 'fr'].",
    ),
    blockedOperator: z.boolean().describe(
        "Lock the operator (UI flag of the segmentation builder).",
    ).optional(),
});

export const zQuery = z.array(zSegmentationCondition).describe(
    "Conditions the companies must ALL match, e.g. [{attribute: 'about.industries', operator: 'or', sign: 'equals', values: ['retail', 'internet']}, {attribute: 'locations.headquarters.country.code', operator: 'or', sign: 'equals', values: ['us']}].",
);

export const zSearchFields = z.array(z.enum(["about.name", "domain.domain"]))
    .describe("Fields the free-text `search` applies to.");
