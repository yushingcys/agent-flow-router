import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `duckduckgo_maps` engine query parameters (https://serpapi.com/duckduckgo-maps-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zDuckduckgoMapsQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The query you want to search. You can use anything that you would use in a regular DuckDuckGo Maps search.",
    ),
    bbox: z.string().describe(
        "An area where you want your q (query) to be applied. The value consists of latitude/longitude pair. The first pair marks the top left corner and the second pair marks the bottom right corner of the map area box. It has to be constructed in the next sequence: latitude_tl + , + longitude_tl + , + latitude_br + , + longitude_br This will form a string that looks like this: e.g.",
    ).optional(),
    lat: z.number().describe(
        "Defines a GPS latitude for the search origin. Parameter is required when using lon parameter.",
    ).optional(),
    lon: z.number().describe(
        "Defines a GPS longitude for the search origin. Parameter is required when using lat parameter.",
    ).optional(),
    strict_bbox: z.string().describe(
        "Whether you strictly want your search to follow the bbox coordinates. It can be set to 1 (strict - default), or 0 (off).",
    ).optional(),
    ...serpApiParams,
});
