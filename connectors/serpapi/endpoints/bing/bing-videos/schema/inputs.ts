import { z } from "zod";
import { serpApiParams, zDevice } from "../../../../schema/common.ts";

/** `bing_videos` engine query parameters (https://serpapi.com/bing-videos-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zBingVideosQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The search query. You can use anything that you would use in a regular Bing Videos search.",
    ),
    mkt: z.string().describe(
        "The market where the results come from (e.g. en-US). Typically, mkt is the country where the user is making the request from. However, it could be a different country if the user is not located in a country where Bing Videos API delivers results. The market must be in the form <language code>-<country code>. For example, en-US. The string is case insensitive. For a list of possible market values, see Market Codes.",
    ).optional(),
    cc: z.string().describe(
        "The country to search from. It follows the 2-character ISO_3166-1 format. (e.g., us for United States, de for Germany, gb for United Kingdom, etc.).",
    ).optional(),
    setlang: z.string().describe(
        "The language to search with. It follows the 2-character ISO_3166-1 format. (e.g., us for United States, de for Germany, gb for United Kingdom, etc.). You can view all valid language codes here.",
    ).optional(),
    first: z.number().describe(
        "Parameter controls the offset of the organic results. This parameter defaults to 1. (e.g., first=10 will move the 10th organic result to the first position).",
    ).optional(),
    length: z.string().describe(
        "Filtering videos by duration. It can be set to: short - Short (less than 5 minutes) medium - Medium (5-20 minutes) long - Long (more than 20 minutes)",
    ).optional(),
    date: z.string().describe(
        "Filtering videos by date. It can be set to: lt1440 - Past 24 hours lt10080 - Past week lt43200 - Past month lt525600 - Past year",
    ).optional(),
    resolution: z.string().describe(
        "Filtering videos by resolution type. It can be set to: lowerthan_360p - Lower than 360p 360p - 360p or higher 480p - 480p or higher 720p - 720p or higher 1080p - 1080p or higher",
    ).optional(),
    source_site: z.string().describe(
        "Filtering videos by source. It can be set to: dailymotion.com - DailyMotion vimeo.com - Vimeo metacafe.com - Metacafe hulu.com - Hulu vevo.com - VEVO myspace.com - Myspace mtv.com - MTV cbsnews.com - CBS foxnews.com - FOX cnn.com - CNN msn.com - MSN",
    ).optional(),
    price: z.string().describe(
        "Filtering videos by price. It can be set to: free - Free paid - Paid",
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
