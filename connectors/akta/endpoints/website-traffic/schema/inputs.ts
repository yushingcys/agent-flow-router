import { z } from "zod";
import { zCompany } from "../../../schema/common.ts";

/** Akta /v1/company/website-traffic query params. */
export const zWebsiteTrafficQueryParams = z.object({
    company: zCompany,
}).strict();
