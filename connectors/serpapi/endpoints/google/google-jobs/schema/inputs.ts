import { z } from "zod";
import {
    serpApiParams,
    zGoogleDomain,
    zLocation,
    zUule,
} from "../../../../schema/common.ts";

/** `google_jobs` engine query parameters (https://serpapi.com/google-jobs-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleJobsQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The query you want to search.",
    ),
    location: zLocation.optional(),
    uule: zUule.optional(),
    google_domain: zGoogleDomain.optional(),
    gl: z.string().describe(
        "The country to use for the Google Jobs search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France)",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google Jobs search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    next_page_token: z.string().describe(
        "The next page token. It is used for retrieving the next page of results. Up to 10 results are returned per page. The next page token can be found in the SerpApi JSON response: serpapi_pagination -> next_page_token Usage of start parameter (results offset) has been discontinued by Google.",
    ).optional(),
    chips: z.string().describe(
        "Additional query conditions. Top of a job search page contains elements called chips, its values are extracted in order to be passed to chips parameter. E.g. city:Owg_06VPwoli_nfhBo8LyA== will return results for New York. This parameter has been deprecated by Google.",
    ).optional(),
    lrad: z.number().describe(
        "Defines search radius in kilometers. Does not strictly limit the radius.",
    ).optional(),
    ltype: z.string().describe(
        "Parameter will filter the results by work from home. This parameter has been deprecated by Google.",
    ).optional(),
    uds: z.string().describe(
        "Parameter enables to filter search. It's a string provided by Google as a filter. uds values are provided under the section: filters with uds, q and serpapi_link values provided for each filter.",
    ).optional(),
    ...serpApiParams,
});
