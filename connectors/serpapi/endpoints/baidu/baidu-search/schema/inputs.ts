import { z } from "zod";
import { serpApiParams, zDevice } from "../../../../schema/common.ts";

/** `baidu` engine query parameters (https://serpapi.com/baidu-search-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zBaiduSearchQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The search query, including all Baidu search operators. (e.g., inurl:, site:, intitle:, etc.).",
    ),
    ct: z.string().describe(
        "Which language to restrict results. Available options: 1 - All languages 2 - Simplified Chinese 3 - Traditional Chinese",
    ).optional(),
    pn: z.number().describe(
        "The result offset. It skips the given number of results. It's used for pagination. (e.g., 0 (default) is the first page of results, 10 is the 2nd page of results, 20 is the 3rd page of results, etc.).",
    ).optional(),
    rn: z.number().describe(
        "The maximum number of results to return, limited to 50. (e.g., 10 (default) returns 10 results, 30 returns 30 results, and 50 returns 50 results). This parameter is only available for desktop and tablet searches.",
    ).optional(),
    gpc: z.string().describe(
        "The time period for results. (e.g., stf=1792469339,1793074139|stftype=1 only returns results from the past 7 days. First integer within the parameter,1792469339 is Unix Timestamp for 7 days ago. Second integer,1793074139 is Unix Timestamp for now.).",
    ).optional(),
    q5: z.string().describe(
        "Similar to using inurl: or intitle:. (e.g., 1 to search by page title, 2 to search by web address.).",
    ).optional(),
    q6: z.string().describe(
        "Similar to using site:. (e.g., q6=serpapi.com to search for results only from the domain serpapi.com).",
    ).optional(),
    bs: z.string().describe(
        "Defines the previous search query.",
    ).optional(),
    oq: z.string().describe(
        "Defines the original search query when navigated from a related search.",
    ).optional(),
    f: z.string().describe(
        "Defines the originating search type. (e.g., 8 is a normal search, 3 is from the suggestion list, and 1 is a related search.",
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
