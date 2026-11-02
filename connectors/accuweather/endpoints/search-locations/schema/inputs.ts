import { z } from "zod";
import { zDetails, zLanguage } from "../../../schema/common.ts";

/** `GET /locations/v1/search` query parameters
 *  (developer.accuweather.com/core-weather/text-search, read 2026-10-29). */
export const zSearchLocationsQuery = z.strictObject({
    q: z.string().min(1).describe(
        "City name, postal code, or point of interest to search for, " +
            "e.g. London, 10001, or Eiffel Tower.",
    ),
    language: zLanguage.optional(),
    details: zDetails.optional(),
    offset: z.number().int().min(0).describe(
        "Results come in sets of 25: 0 returns the first 25, 1 the next " +
            "25, and so on.",
    ).optional(),
    alias: z.number().int().min(0).max(2).describe(
        "Alias matching: 0 always, 1 never, 2 only when no official " +
            "match exists (vendor default 2).",
    ).optional(),
});
