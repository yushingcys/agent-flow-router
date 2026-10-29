import { z } from "zod";
import { zQuery, zSearchFields } from "../../../schema/segmentation.ts";

/** POST /v2/companies/count body. */
export const zCountCompaniesBody = z.object({
    query: zQuery.optional(),
    search: z.string().describe(
        "Free-text search on the company name or domain.",
    ).optional(),
    searchFields: zSearchFields.optional(),
    actionId: z.number().int().describe(
        "Count the companies of a previously requested action.",
    ).optional(),
});
