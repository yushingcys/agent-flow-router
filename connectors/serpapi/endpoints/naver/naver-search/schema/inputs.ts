import { z } from "zod";
import { serpApiParams, zDevice } from "../../../../schema/common.ts";

/** `naver` engine query parameters (https://serpapi.com/naver-search-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zNaverSearchQuery = z.strictObject({
    query: z.string().min(1).describe(
        "The search query. You can use anything that you would use in a regular Naver search. (e.g., 'query', NOT, OR, site:, filetype:, near:, ip:, loc:, feed: etc.).",
    ),
    start: z.number().describe(
        "Parameter controls the offset of the organic results. This parameter defaults to 1 (except for the web). (e.g. The formula for all searches except the web is start = (page number * 10) - 9 e.g. Page number 3 (3 * 10) - 9 = 21) The formula for the web will be start = (page number * 15) - 29 e.g. Page number 3 (3 * 15) - 29 = 16.",
    ).optional(),
    page: z.number().describe(
        "The page parameter does the start parameter math for you! Just define the page number you want. Pagination starts from 1.",
    ).optional(),
    num: z.number().describe(
        "The maximum number of results to return. 50 (default) returns 50 results. Maximum number of results to return is 100. Parameter can only be used with Naver Images API.",
    ).optional(),
    where: z.string().describe(
        "The Search type. This parameter defaults to nexearch. Available options: nexearch: regular Naver Search, web: Naver Web Organic Results, video: Naver Video Results, news: Naver News Results, image: Naver Images API.",
    ).optional(),
    sort_by: z.string().describe(
        "How the search results are sorted. This parameter defaults to 0 for Naver News Results, and r for other search types. For Naver News Results: 0: Relevance (default), 1: Latest, 2: Oldest (only supported for news). For other search types: r: Relevance (default), dd: Latest.",
    ).optional(),
    period: z.string().describe(
        "The time period for search results. This parameter defaults to all. Available options: all: search without time restrictions (default), 1h: 1 hour, 1d: 1 day, 1w: 1 week, 1m: 1 month, 3m: 3 months, 6m: 6 months, 1y: 1 year, Custom date range in the format fromYYYYMMDDtoYYYYMMDD (e.g., from20250801to20250830).",
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
