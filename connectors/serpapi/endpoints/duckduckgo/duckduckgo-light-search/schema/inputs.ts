import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `duckduckgo_light` engine query parameters (https://serpapi.com/duckduckgo-light-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zDuckduckgoLightSearchQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The query you want to search. You can use anything that you would use in a regular DuckDuckGo search. (e.g., inurl:, site:, intitle:, etc.) Parameter length can not exceed 500 characters.",
    ),
    kl: z.string().describe(
        "The region to use for the DuckDuckGo search. Region code examples: us-en for the United States, uk-en for United Kingdom, or fr-fr for France.",
    ).optional(),
    df: z.string().describe(
        "Results filtered by date. It can be set to: d: Past day, w: Past week, m: Past month, y: Past year, or you can pass a custom date following the next format: from_date + .. + to_date (e.g. 2021-06-15..2024-06-16).",
    ).optional(),
    next_page_token: z.string().describe(
        "The next page token. It is used for retrieving the next page results. 15 results are returned per page.",
    ).optional(),
    ...serpApiParams,
});
