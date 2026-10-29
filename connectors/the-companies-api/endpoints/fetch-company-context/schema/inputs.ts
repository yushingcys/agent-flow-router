import { z } from "zod";

/** GET /v2/companies/{domain}/context path parameters. */
export const zContextPathParams = z.object({
    domain: z.string().min(1).describe("Company domain, e.g. microsoft.com."),
});
