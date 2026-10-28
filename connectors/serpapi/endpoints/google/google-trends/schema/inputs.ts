import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_trends` engine query parameters (https://serpapi.com/google-trends-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleTrendsQuery = z.strictObject({
    q: z.string().min(1).describe(
        'The query or queries you want to search. You can use anything that you would use in a regular Google Trends search. The maximum number of queries per search is 5 (this only applies to "Interest over time" and "Compared breakdown by region" data_type, other types of data will only accept 1 query per search). When passing multiple queries you need to use a comma (,) to separate them (e.g.',
    ),
    hl: z.string().describe(
        "The language to use for the Google Trends search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    geo: z.string().describe(
        "The location from where you want the search to originate. It defaults to Worldwide (activated when the value of geo parameter is not set or empty). You can also set a different location for each query by separating values with a comma (,), following the order of the queries in q.",
    ).optional(),
    region: z.string().describe(
        'Getting more specific results when using "Compared breakdown by region" and "Interest by region" data_type charts. Other data_type charts do not accept region parameter. The default value depends on the geo location that is set. Available options: COUNTRY - Country REGION - Subregion DMA - Metro CITY - City Not all region options will return results for every geo location.',
    ).optional(),
    data_type: z.string().describe(
        "The type of search you want to do. Available options: TIMESERIES - Interest over time (default) - Accepts both single and multiple queries per search. GEO_MAP - Compared breakdown by region - Accepts only multiple queries per search. GEO_MAP_0 - Interest by region - Accepts only single query per search. RELATED_TOPICS - Related topics - Accepts only single query per search.",
    ).optional(),
    tz: z.string().describe(
        "A time zone offset. The default value is set to 420 (Pacific Day Time(PDT): -07:00). Value is shown in minutes and can span from -1439 to 1439. tz can be calculated using the time difference between UTC +0 and desired timezone. Examples: 420 - PDT 600 - Pacific/Tahiti -540 - Asia/Tokyo -480 - Canada/Pacific.",
    ).optional(),
    cat: z.string().describe(
        "A search category. The default value is 0 (All categories). You can find or download all supported values in the Google Trends Categories list. Note that these are different from the categories supported for Google Trends Trending Now",
    ).optional(),
    gprop: z.string().describe(
        "Sorting results by property. The default property is set to Web Search (activated when the value of gprop parameter is not set or empty). Other available options: images - Image Search news - News Search froogle - Google Shopping youtube - YouTube Search",
    ).optional(),
    date: z.string().describe(
        "A date. Available options: now 1-H - Past hour now 4-H - Past 4 hours now 1-d - Past day now 7-d - Past 7 days today 1-m - Past 30 days today 3-m - Past 90 days today 12-m - Past 12 months today 5-y - Past 5 years all - 2004 - present You can also pass custom values: Dates from 2004 to present: yyyy-mm-dd yyyy-mm-dd (e.g. 2021-10-15 2022-05-25) Dates with hours within a week range: yyyy-mm-ddThh yyyy-mm-ddThh (e.g.",
    ).optional(),
    csv: z.string().describe(
        "Retrieving the CSV results. Set the parameter to true to retrieve CSV results as an array.",
    ).optional(),
    include_low_search_volume: z.string().describe(
        "Including low search volume regions in the results. Set the parameter to true to include low search volume regions in the results. This parameter is ignored if data_type is not set to GEO_MAP or GEO_MAP_0.",
    ).optional(),
    ...serpApiParams,
});
