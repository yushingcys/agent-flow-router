import { z } from "zod";
import { serpApiParams, zDevice } from "../../../../schema/common.ts";

/** `yandex_videos` engine query parameters (https://serpapi.com/yandex-videos-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zYandexVideosQuery = z.strictObject({
    text: z.string().min(1).describe(
        "The search query. You can use anything that you would use in a regular Yandex Videos search.",
    ),
    yandex_domain: z.string().describe(
        "The Yandex Videos domain to use. It defaults to yandex.com.",
    ).optional(),
    duration: z.string().describe(
        "Filtering videos by duration. It can be set to: short - Less than 10 minutes medium - 10-65 minutes long - More than 65 minutes",
    ).optional(),
    hd: z.string().describe(
        "Filtering videos by quality.",
    ).optional(),
    within: z.string().describe(
        "Parameter is used to limit the search results to specific time period. It defaults to all time",
    ).optional(),
    p: z.number().describe(
        "The page number. Pagination starts from 0, and it can return up to 30 results.",
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
