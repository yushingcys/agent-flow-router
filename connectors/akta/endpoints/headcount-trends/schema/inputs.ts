import { z } from "zod";
import { zCompany } from "../../../schema/common.ts";

/** Akta /v1/company/headcount-trends query params. */
export const zHeadcountTrendsQueryParams = z.object({
    company: zCompany,
}).strict();
