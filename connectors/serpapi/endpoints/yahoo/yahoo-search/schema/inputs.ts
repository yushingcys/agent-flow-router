import { z } from "zod";
import { serpApiParams, zDevice } from "../../../../schema/common.ts";

/** `yahoo` engine query parameters (https://serpapi.com/yahoo-search-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zYahooSearchQuery = z.strictObject({
    p: z.string().min(1).describe(
        "The search query. You can use anything that you would use in a regular Yahoo! search.",
    ),
    yahoo_domain: z.string().describe(
        "The Yahoo! domain to use. It defaults to search.yahoo.com. If specified domain is allowed, it will be prepended to the domain (e.g., fr.search.yahoo.com). You can check a full list of supported Yahoo! domains.",
    ).optional(),
    vc: z.string().describe(
        "The country to use for the Yahoo! search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France)",
    ).optional(),
    vl: z.string().describe(
        "Language to limit the search to. It uses lang_{two-letter language code} to specify languages. (e.g., vl=lang_fr will only search French). fl will be set to 1 if this parameter is used. You can check a full list of supported Yahoo! languages.",
    ).optional(),
    b: z.number().describe(
        "The result offset. It skips the given number of results. It's used for pagination. (e.g., 1 (default) is the first page of results, 11 is the 2nd page of results, 21 is the 3rd page of results, etc.).",
    ).optional(),
    vm: z.string().describe(
        "The level of filtering for adult content. Strict: r, Moderate: i, Off: p",
    ).optional(),
    vs: z.string().describe(
        "Filter results by top-level domains separated by ','. (e.g., .com,.org)",
    ).optional(),
    vf: z.string().describe(
        "All formats or specific file format like pdf or txt. You can check a full list of supported Yahoo! file formats.",
    ).optional(),
    fr2: z.string().describe(
        "Parameter is responsible for rendering positions and expansions for some elements (e.g., p:s,v:w,m:trendingdomain_center to expand Related Trending Searches).",
    ).optional(),
    d: z.string().describe(
        'Parameter specifies the destination for related topics. By including a unique identifier for the destination page, this parameter directs users to specific content related to their search query, providing them with more targeted results. (e.g. {"dn":"topic","ykid":"71698d3e-6ef0-4fcd-8551-1ffe56058857","pos":"0","oq":"Coffee","rq":"Drinking"})',
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
