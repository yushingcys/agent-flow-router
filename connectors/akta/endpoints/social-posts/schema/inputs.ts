import { z } from "zod";
import { zCompany } from "../../../schema/common.ts";

/** Akta /v1/company/posts query params. */
export const zSocialPostsQueryParams = z.object({
    company: zCompany,
    limit: z.number().int().min(1).optional().describe(
        "Maximum number of posts to return. Default 10.",
    ),
    offset: z.number().int().min(0).optional().describe(
        "Number of posts to skip before returning records (pagination).",
    ),
}).strict();
