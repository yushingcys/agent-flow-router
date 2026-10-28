import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `bing_maps` engine query parameters (https://serpapi.com/bing-maps-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zBingMapsQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The search query. You can use anything that you would use in a regular Bing Maps search.",
    ),
    cp: z.string().describe(
        "GPS coordinates of location where you want your q (query) to be applied. It has to be constructed in the next sequence: latitude + ~ + longitude This will form a string that looks like this: e.g. 40.7455096~-74.0083012.",
    ).optional(),
    setlang: z.string().describe(
        "The language to search with. It follows the 2-character ISO_3166-1 format. (e.g., us for United States, de for Germany, gb for United Kingdom, etc.). You can view all supported language codes on Bing Maps.",
    ).optional(),
    place_id: z.string().describe(
        "The unique reference to a place on a Bing Map. Place IDs are available for most locations, including businesses, landmarks, parks, and intersections. You can find the place_id using our Bing Maps API and Bing Local Pack API. place_id can be used without any other optional parameter including q parameter.",
    ).optional(),
    first: z.number().describe(
        "Parameter controls the offset of the local results. This parameter defaults to 0. (e.g. When count=10, the second page result start from first=10).",
    ).optional(),
    count: z.number().describe(
        "Parameter controls the number of results per page. This parameter is only a suggestion and might not reflect the returned results. Maximum results per page is 30",
    ).optional(),
    ...serpApiParams,
});
