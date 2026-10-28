import { z } from "zod";
import { serpApiParams, zDevice } from "../../../../schema/common.ts";

/** `yahoo_videos` engine query parameters (https://serpapi.com/yahoo-videos-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zYahooVideosQuery = z.strictObject({
    p: z.string().min(1).describe(
        "The search query. You can use anything that you would use in a regular Yahoo! Videos search.",
    ),
    yahoo_domain: z.string().describe(
        "The Yahoo! domain to use. It defaults to search.yahoo.com. If specified domain is allowed, it will be prepended to the domain (e.g., fr.search.yahoo.com). You can check a full list of supported Yahoo! domains.",
    ).optional(),
    durs: z.string().describe(
        "Filtering videos by length. It can be set to: short - Short (less than 5 minutes) medium - Medium (5-20 minutes) long - Long (more than 20 minutes)",
    ).optional(),
    vage: z.string().describe(
        "Filtering videos by date. It can be set to: day - Past 24 hours week - Past week month - Past month year - Past year",
    ).optional(),
    vres: z.string().describe(
        "Filtering videos by resolution. It can be set to: 360p - 360p or higher 480p - 480p or higher 720p - 720p or higher 1080p - 1080p or higher",
    ).optional(),
    vsite: z.string().describe(
        "Filtering videos by source. It can be set to: youtube - YouTube dailymotion - Dailymotion vimeo - Vimeo mtv - MTV cbsnews - CBS foxnews - Fox cnn - CNN msn - MSN",
    ).optional(),
    b: z.number().describe(
        "The result offset. It skips the given number of results. It's used for pagination. (e.g., 1 (default) starts from the first result, 61 starts from the 61st result, 121 starts from the 121st result, etc.).",
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
