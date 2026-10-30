import { z } from "zod";
import { zDetails, zLanguage } from "../../../schema/common.ts";

/** `GET /locations/v1/topcities/{group}`
 *  (developer.accuweather.com/core-weather/list, read 2026-10-29). */
export const zListCitiesPath = z.strictObject({
    group: z.enum(["50", "100", "150"]).describe(
        "How many of the world's largest cities to list: 50, 100, or 150.",
    ),
});

export const zListCitiesQuery = z.strictObject({
    language: zLanguage.optional(),
    details: zDetails.optional(),
});
