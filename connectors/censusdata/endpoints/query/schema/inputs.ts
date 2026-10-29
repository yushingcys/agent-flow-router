import { z } from "zod";

/** `GET /query` query parameters (https://censusdata.xyz/openapi.json,
 *  read 2026-10-29). `api_key` is auth, injected by the provider. */
export const zQueryQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The Census question in plain English, naming the indicators, " +
            "geographies, and years, e.g. 'Compare poverty rates in Utah " +
            "and Idaho in 2022.'",
    ),
});
