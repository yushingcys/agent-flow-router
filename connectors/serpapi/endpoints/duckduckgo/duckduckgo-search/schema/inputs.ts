import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `duckduckgo` engine query parameters (https://serpapi.com/duckduckgo-search-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zDuckduckgoSearchQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The query you want to search. You can use anything that you would use in a regular DuckDuckGo search. (e.g., inurl:, site:, intitle:, etc.) Parameter length can not exceed 500 characters.",
    ),
    kl: z.string().describe(
        "The region to use for the DuckDuckGo search. Region code examples: us-en for the United States, uk-en for United Kingdom, or fr-fr for France.",
    ).optional(),
    search_assist: z.boolean().describe(
        "Parameter determines if DuckDuckGo's AI Search Assist will be returned in the response. It can be set to true or false (default). search_assist and m can't be used together.",
    ).optional(),
    safe: z.string().describe(
        "The level of filtering for adult content. It can be set to 1 (Strict), -1 (Moderate - default), or -2 (Off).",
    ).optional(),
    df: z.string().describe(
        "Results filtered by date. It can be set to: d: Past day, w: Past week, m: Past month, y: Past year, or you can pass a custom date following the next format: from_date + .. + to_date (e.g. 2021-06-15..2024-06-16).",
    ).optional(),
    start: z.number().describe(
        "The result offset. It skips the given number of results. When offset is not being used (initial search request, start parameter is set to 0 or left blank), up to 35 organic_results can be returned. When offset is being used (start parameter is greater than 0), up to 50 organic_results can be returned. DuckDuckGo may return duplicated results or a variable number of results.",
    ).optional(),
    m: z.number().describe(
        "The maximum number of results to return. Default value:50 Min. value:1 Max. value:50 When offset is not being used (initial search request, start parameter is set to 0 or left blank), up to 35 organic_results can be returned. DuckDuckGo may return duplicated results or a variable number of results. This is more likely to happen with higher start and m parameters. m and search_assist can't be used together.",
    ).optional(),
    ...serpApiParams,
});
