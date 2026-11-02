import { z } from "zod";

/** `GET /v2/city_ranking` query parameters (api-docs.iqair.com, "Get
 *  global city ranking", read 2026-10-29). Mirror carries optionality
 *  only (D25). */
export const zCityRankingQuery = z.strictObject({
    sort: z.string().describe(
        "Sort order of the ranking; the vendor default is highest AQI " +
            "first.",
    ).optional(),
    country: z.string().describe(
        "Only rank cities in this country (English name as IQAir lists " +
            "it, e.g. USA).",
    ).optional(),
});
