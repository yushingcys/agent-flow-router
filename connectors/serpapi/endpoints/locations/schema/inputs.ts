import { z } from "zod";

/** Locations API query parameters (https://serpapi.com/locations-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zLocationsQuery = z.strictObject({
    q: z.string().describe(
        "Only return locations whose name contains this string, e.g. " +
            "Austin finds Austin, TX and The University of Texas at Austin.",
    ).optional(),
    limit: z.number().int().min(1).max(10).describe(
        "Maximum number of locations to return (at most 10).",
    ).optional(),
});
