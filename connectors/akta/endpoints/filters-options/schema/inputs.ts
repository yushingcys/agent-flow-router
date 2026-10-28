import { z } from "zod";

/** Akta /v1/filters/options JSON body. */
export const zFilterOptionsBody = z.object({
    dropdowns: z.array(
        z.object({
            dropdown_type: z.string().min(1).describe(
                "A filter field name, as returned in 'dropdown_type' by " +
                    "the Akta Filters List endpoint (e.g. " +
                    "'firmographic.company_type').",
            ),
        }).strict(),
    ).describe("The filter fields to look up allowed values for."),
}).strict();
