import { z } from "zod";
import { serpApiParams, zDevice } from "../../../../schema/common.ts";

/** `bing_news` engine query parameters (https://serpapi.com/bing-news-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zBingNewsQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The search query. You can use anything that you would use in a regular Bing search. (e.g., 'query', NOT, OR, site:, filetype:, near:, ip:, loc:, feed: etc.).",
    ),
    mkt: z.string().describe(
        "The market where the results come from (e.g. en-US). Typically, mkt is the country where the user is making the request from. However, it could be a different country if the user is not located in a country where Bing delivers results. The market must be in the form <language code>-<country code>. For example, en-US. The string is case insensitive. For a list of possible market values, see Market Codes.",
    ).optional(),
    cc: z.string().describe(
        "The country to search from. It follows the 2-character ISO_3166-1 format. (e.g., us for United States, de for Germany, gb for United Kingdom, etc.).",
    ).optional(),
    first: z.number().describe(
        "Parameter controls the offset of the organic results. This parameter defaults to 1. (e.g., first=10 will move the 10th organic result to the first position).",
    ).optional(),
    count: z.number().describe(
        "Parameter controls the number of results per page. This parameter is only a suggestion and might not reflect actual results returned.",
    ).optional(),
    qft: z.string().describe(
        'Results sorted by date. If the parameter is not set, it will default to the "Best match" sorting, otherwise, if set to: e.g. interval="4", it will show results from the past hour. Other options are: interval="7": Past 24 hours, interval="8": Past 7 days, interval="9": Past 30 days, sortbydate="1": Most Recent',
    ).optional(),
    safeSearch: z.string().describe(
        "The level of filtering for adult content. It can be set to: Off to return webpages with adult text, images, or videos. Moderate to return webpages with adult text, but not adult images or videos. Strict to not return webpages with adult text, images, or videos.",
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
