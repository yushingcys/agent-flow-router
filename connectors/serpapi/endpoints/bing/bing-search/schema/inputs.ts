import { z } from "zod";
import {
    serpApiParams,
    zDevice,
    zLocation,
} from "../../../../schema/common.ts";

/** `bing` engine query parameters (https://serpapi.com/bing-search-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zBingSearchQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The search query. You can use anything that you would use in a regular Bing search. (e.g., 'query', NOT, OR, site:, filetype:, near:, ip:, loc:, feed: etc.).",
    ),
    location: zLocation.optional(),
    lat: z.number().describe(
        "Defines a GPS latitude for the search origin",
    ).optional(),
    lon: z.number().describe(
        "Defines a GPS longitude for the search origin",
    ).optional(),
    mkt: z.string().describe(
        "The market where the results come from (e.g. en-US). Typically, mkt is the country where the user is making the request from. However, it could be a different country if the user is not located in a country where Bing delivers results. The market must be in the form <language code>-<country code>. For example, en-US. The string is case insensitive. For a list of possible market values, see Market Codes.",
    ).optional(),
    cc: z.string().describe(
        "The country to search from. It follows the 2-character ISO_3166-1 format. (e.g., us for United States, de for Germany, gb for United Kingdom, etc.).",
    ).optional(),
    first: z.number().describe(
        "Parameter controls the offset of the organic results. This parameter defaults to 1. (e.g., first=10 will move the 10th organic result to the first position).",
    ).optional(),
    safeSearch: z.string().describe(
        "The level of filtering for adult content. It can be set to: Off to return webpages with adult text, images, or videos. Moderate to return webpages with adult text, but not adult images or videos. Strict to not return webpages with adult text, images, or videos.",
    ).optional(),
    filters: z.string().describe(
        'Parameter allows usage of a more complex filtering options such as filtering by date range ex1:"ez5_18169_18230" or using a specific display filters such as ufn:"Wunderman+Thompson"+sid:"5bede9a2-1bda-9887-e6eb-30b1b8b6b513"+catguid:"5bede9a2-1bda-9887-e6eb-30b1b8b6b513_cfb02057"+segment:"generic.carousel"+entitysegment:"Organization".',
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
