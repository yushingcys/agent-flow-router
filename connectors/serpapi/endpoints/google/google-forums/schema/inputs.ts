import { z } from "zod";
import {
    serpApiParams,
    zDevice,
    zLocation,
    zUule,
} from "../../../../schema/common.ts";

/** `google_forums` engine query parameters (https://serpapi.com/google-forums-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleForumsQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The query you want to search. To search for events in a specific location, just include the location inside your search query (e.g. Events in Austin, TX).",
    ),
    location: zLocation.optional(),
    uule: zUule.optional(),
    gl: z.string().describe(
        "The country to use for the Google Forums search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France).",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google Forums search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    period_unit: z.string().describe(
        "The time period unit to search for the recent images, e.g. from past minute, hour, day etc. Options: s - Second n - Minute h - Hour d - Day w - Week m - Month y - Year This parameter can't be used with start_date/end_date parameters.",
    ).optional(),
    period_value: z.string().describe(
        "An optional time period value that can be used with period_unit to describe time periods like 15 seconds, 42 hours, 178 days etc. Default value: 1 Value range: 1..2147483647",
    ).optional(),
    start_date: z.string().describe(
        "The start date of time period you want to limit the image search to. Format: YYYYMMDD Example: 20251201 This parameter can't be used with period_unit/period_value parameters. start_date with blank end_date produces date range FROM start_date TO today.",
    ).optional(),
    end_date: z.string().describe(
        "The end date of time period you want to limit the image search to. Format: YYYYMMDD Example: 20251231 This parameter can't be used with period_unit/period_value parameters. end_date with blank start_date produces date range BEFORE end_date.",
    ).optional(),
    start: z.number().describe(
        "The result offset. It skips the given number of results. It's used for pagination. (e.g., 0 (default) is the first page of results, 10 is the 2nd page of results, 20 is the 3rd page of results, etc.).",
    ).optional(),
    nfpr: z.string().describe(
        "The exclusion of results from an auto-corrected query when the original query is spelled wrong. It can be set to 1 to exclude these results, or 0 to include them (default). Note that this parameter may not prevent Google from returning results for an auto-corrected query if no other results are available.",
    ).optional(),
    filter: z.string().describe(
        "If the filters for 'Similar Results' and 'Omitted Results' are on or off. It can be set to 1 (default) to enable these filters, or 0 to disable these filters.",
    ).optional(),
    tbs: z.string().describe(
        "(to be searched) parameter defines advanced search parameters that aren't possible in the regular query field. (e.g., advanced search for dates, time period, etc.).",
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
