import { z } from "zod";

/** `GET /v2/city` query parameters (api-docs.iqair.com, "Get specified
 *  city data", read 2026-10-29). Mirror carries optionality only (D25). */
export const zCityQuery = z.strictObject({
    city: z.string().min(1).describe(
        "City's English name as IQAir lists it, e.g. Los Angeles.",
    ),
    state: z.string().min(1).describe(
        "State or province's English name as IQAir lists it, e.g. " +
            "California.",
    ),
    country: z.string().min(1).describe(
        "Country's English name as IQAir lists it, e.g. USA.",
    ),
});
