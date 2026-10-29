import { z } from "zod";

/** `GET /explore-variables` query parameters
 *  (https://censusdata.xyz/openapi.json, read 2026-10-29). */
export const zExploreVariablesQuery = z.strictObject({
    keyword: z.string().min(1).describe(
        "Topic keyword to search across the 28,000+ Census variables, " +
            "e.g. veterans, internet, rent, disability.",
    ),
});
