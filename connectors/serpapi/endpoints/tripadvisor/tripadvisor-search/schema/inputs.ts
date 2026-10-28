import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `tripadvisor` engine query parameters (https://serpapi.com/tripadvisor-search-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zTripadvisorSearchQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The query you want to search. You can use anything that you would use in a regular Tripadvisor search.",
    ),
    lat: z.number().describe(
        "Defines a GPS latitude for the search origin. This parameter might not be supported for all queries.",
    ).optional(),
    lon: z.number().describe(
        "Defines a GPS longitude for the search origin. This parameter might not be supported for all queries.",
    ).optional(),
    tripadvisor_domain: z.string().describe(
        "The Tripadvisor domain to use. It defaults to tripadvisor.com.",
    ).optional(),
    ssrc: z.string().describe(
        "This parameter specifies the search filter you want to use for the Tripadvisor search. Available options: a - All Results r - Restaurants A - Things to Do h - Hotels g - Destinations v - Vacation Rentals f - Forums NOTE: Tripadvisor has discontinued support for Vacation Rentals. As a result, using ssrc=v may return incomplete results or no results at all.",
    ).optional(),
    offset: z.number().describe(
        "The result offset. It skips the given number of results. It's used for pagination. (e.g., 0 (default) is the first page of results, 30 is the 2nd page of results, 60 is the 3rd page of results, etc.). This parameter might not be supported for all queries.",
    ).optional(),
    limit: z.number().describe(
        "The maximum number of results to return. (e.g., 30 (default) returns 30 results, 60 returns 60 results, and 100 returns 100 results).",
    ).optional(),
    ...serpApiParams,
});
