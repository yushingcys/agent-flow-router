import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `yahoo_trends` engine query parameters (https://serpapi.com/yahoo-trends-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zYahooTrendsQuery = z.strictObject({
    next_page_token: z.string().describe(
        "The next page token. It is used for retrieving the next page of results. Leave it unset for the first page. Up to 100 results are returned per page; Yahoo! may return fewer. The next page token can be found in the SerpApi JSON response: serpapi_pagination -> next_page_token. It is only present while more results are available.",
    ).optional(),
    full_video_links: z.boolean().describe(
        "Whether to include playable video links. It can be set to true to include a full_video_link for each topic video, or false (default) to skip them. Enabling it performs an additional request to Yahoo!, which may increase the search response time. Full video links expire after one hour. To retrieve fresh links, run a new search with the no_cache parameter enabled.",
    ).optional(),
    ...serpApiParams,
});
