import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `baidu_news` engine query parameters (https://serpapi.com/baidu-news-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zBaiduNewsQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The search query, including all Baidu search operators. (e.g., inurl:, site:, intitle:, etc.).",
    ),
    ct: z.string().describe(
        "Which language to restrict results. Available options: 1 - All Languages. 2 - Simplified Chinese 3 - Traditional Chinese.",
    ).optional(),
    pn: z.number().describe(
        "The result offset. It skips the given number of results. It's used for pagination. (e.g., 0 (default) is the first page of results, 10 is the 2nd page of results, 20 is the 3rd page of results, etc.).",
    ).optional(),
    rn: z.number().describe(
        "The maximum number of results to return, limited to 50. (e.g., 10 (default) returns 10 results, 30 returns 30 results, and 50 returns 50 results).",
    ).optional(),
    rtt: z.string().describe(
        "The sort type for results. Available options: 1 - Sort by attraction (default) 4 - Sort by time",
    ).optional(),
    medium: z.string().describe(
        "Medium filtering for results. Available options: 0 - No filtering 1 - Show results from medium sites 2 - Show results from Baijiahao (baijiahao.baidu.com)",
    ).optional(),
    ...serpApiParams,
});
