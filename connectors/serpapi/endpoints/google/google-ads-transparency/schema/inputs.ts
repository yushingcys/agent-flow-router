import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_ads_transparency_center` engine query parameters (https://serpapi.com/google-ads-transparency-center-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleAdsTransparencyQuery = z.strictObject({
    advertiser_id: z.string().describe(
        "The Google Advertiser ID. It can be found in the Ads Transparency Center advertiser URL. For example, the advertiser ID for the URL https://adstransparency.google.com/advertiser/AR17828074650563772417 is AR17828074650563772417(Tesla Inc). It accepts either a single ID or multiple IDs separated by commas (,). Example, Single ID: AR17828074650563772417 Multiple IDs: AR17828074650563772417,AR03911981557522366465,...",
    ).optional(),
    text: z.string().describe(
        "The text you want to search, typically related to a domain search within the context of Google Ads. You can use anything that you would normally use in a standard Google Ads Transparency Center search. It can be used as an alternative to advertiser_id. The advertiser_id can be optional when text is present.",
    ).optional(),
    platform: z.string().describe(
        "The target platform where ads are displayed. When not set, it will return results from all platforms (default). Available options: PLAY - Google Play MAPS - Google Maps SEARCH - Google Search SHOPPING - Google Shopping YOUTUBE - YouTube.",
    ).optional(),
    political_ads: z.boolean().describe(
        "The parameter determine if the advertiser promotes political advertisement. Political advertisement is a different category than regular advertisements, and will not appear on the results unless this parameter is set to true. If this parameter is set to true, only political advertisements will appear on the results. By default it is false. This parameter can only be used alongside with the region parameter.",
    ).optional(),
    get_advertiser: z.boolean().describe(
        "Whether to fetch the advertiser details (legal name and country of registration). When set to true, an additional request is made and the advertiser block is included in the results. By default it is false. This parameter can only be used with a single advertiser_id.",
    ).optional(),
    region: z.string().describe(
        "From where you want the search to originate. By default it search results from anywhere.",
    ).optional(),
    start_date: z.string().describe(
        "The start date for which you want the search results to begin. The format for this field is YYYYMMDD. Example: 20221201",
    ).optional(),
    end_date: z.string().describe(
        "The end date for which you want the search results to conclude. The format for this field is YYYYMMDD. Example: 20221231 To set the date for Today / Single Day, you should set end_date as start_date + 1 day.",
    ).optional(),
    creative_format: z.string().describe(
        "The format you want to filter by. Only search results with a similar format will be returned. Available options: text - Text image - Image video - Video",
    ).optional(),
    num: z.number().describe(
        "The maximum number of results to return. (e.g., 40 (default) returns 40 results and 100 returns 100 results).",
    ).optional(),
    next_page_token: z.string().describe(
        "The next page token. It is used for retrieving the next page results.",
    ).optional(),
    ...serpApiParams,
});
