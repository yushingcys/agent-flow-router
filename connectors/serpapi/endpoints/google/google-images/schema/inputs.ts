import { z } from "zod";
import {
    serpApiParams,
    zDevice,
    zGoogleDomain,
    zLocation,
    zUule,
} from "../../../../schema/common.ts";

/** `google_images` engine query parameters (https://serpapi.com/google-images-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleImagesQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The query you want to search. You can use anything that you would use in a regular Google Images search. e.g. inurl:, site:, intitle:.",
    ),
    location: zLocation.optional(),
    uule: zUule.optional(),
    google_domain: zGoogleDomain.optional(),
    gl: z.string().describe(
        "The country to use for the Google Images search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France)",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google Images search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    cr: z.string().describe(
        "One or multiple countries to limit the search to. It uses country{two-letter upper-case country code} to specify countries and | as a delimiter. (e.g., countryFR|countryDE will only search French and German pages).",
    ).optional(),
    period_unit: z.string().describe(
        "The time period unit to search for the recent images, e.g. from past minute, hour, day etc. Options: s - Second n - Minute h - Hour d - Day w - Week m - Month y - Year This parameter can't be used with start_date/end_date parameters. This parameter overrides qdr component of tbs parameter.",
    ).optional(),
    period_value: z.string().describe(
        "An optional time period value that can be used with period_unit to describe time periods like 15 seconds, 42 hours, 178 days etc. Default value: 1 Value range: 1..2147483647",
    ).optional(),
    start_date: z.string().describe(
        "The start date of time period you want to limit the image search to. Format: YYYYMMDD Example: 20241201 This parameter can't be used with period_unit/period_value parameters. start_date with blank end_date produces date range FROM start_date TO today. This parameter overrides cdr and cd_min components of tbs parameter.",
    ).optional(),
    end_date: z.string().describe(
        "The end date of time period you want to limit the image search to. Format: YYYYMMDD Example: 20241231 This parameter can't be used with period_unit/period_value parameters. end_date with blank start_date produces date range BEFORE end_date. This parameter overrides cdr and cd_max components of tbs parameter.",
    ).optional(),
    chips: z.string().describe(
        "Parameter enables to filter image search. It's a string provided by Google as suggested search, like: red apple. Chips are provided under the section: suggested_searches when ijn = 0. Both chips and serpapi_link values are provided for each suggested search.",
    ).optional(),
    tbs: z.string().describe(
        "(to be searched) parameter defines advanced search parameters that aren't possible in the regular query field.",
    ).optional(),
    imgar: z.string().describe(
        "The set aspect ratio of images. Options: s - Square t - Tall w - Wide xw - Panoramic",
    ).optional(),
    imgsz: z.string().describe(
        "The size of images. Options: l - Large m - Medium i - Icon qsvga - Larger than 400×300 vga - Larger than 640×480 svga - Larger than 800×600 xga - Larger than 1024×768 2mp - Larger than 2 MP 4mp - Larger than 4 MP 6mp - Larger than 6 MP 8mp - Larger than 8 MP 10mp - Larger than 10 MP 12mp - Larger than 12 MP 15mp - Larger than 15 MP 20mp - Larger than 20 MP 40mp - Larger than 40 MP 70mp - Larger than 70 MP",
    ).optional(),
    image_color: z.string().describe(
        "The color of images. Options: bw - Black and white trans - Transparent red - Red orange - Orange yellow - Yellow green - Green teal - Teal blue - Blue purple - Purple pink - Pink white - White gray - Gray black - Black brown - Brown This parameter overrides ic and isc components of tbs parameter",
    ).optional(),
    image_type: z.string().describe(
        "The type of images. Options: face - Face photo - Photo clipart - Clip art lineart - Line drawing animated - Animated This parameter overrides itp component of tbs parameter",
    ).optional(),
    licenses: z.string().describe(
        "The scope of licenses of images. Options: f - Free to use or share fc - Free to use or share, even commercially fm - Free to use, share or modify fmc - Free to use, share or modify, even commercially cl - Creative Commons licenses ol - Commercial and other licenses This parameter overrides sur component of tbs parameter",
    ).optional(),
    safe: z.string().describe(
        "The level of filtering for adult content. It can be set to active or off, by default Google will blur explicit content.",
    ).optional(),
    nfpr: z.string().describe(
        "The exclusion of results from an auto-corrected query when the original query is spelled wrong. It can be set to 1 to exclude these results, or 0 to include them (default). Note that this parameter may not prevent Google from returning results for an auto-corrected query if no other results are available.",
    ).optional(),
    filter: z.string().describe(
        "If the filters for 'Similar Results' and 'Omitted Results' are on or off. It can be set to 1 (default) to enable these filters, or 0 to disable these filters.",
    ).optional(),
    ijn: z.number().describe(
        "The page number. Min. value:0 Max. value:99",
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
