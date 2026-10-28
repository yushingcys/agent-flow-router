import { z } from "zod";
import { zCompany } from "../../../schema/common.ts";

/** Akta /v1/company/enrichment/concise query params. */
export const zConciseQueryParams = z.object({
    company: zCompany,
}).strict();
