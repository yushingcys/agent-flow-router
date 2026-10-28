import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_local_services` engine query parameters (https://serpapi.com/google-local-services-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleLocalServicesQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The service you want to search for.",
    ),
    data_cid: z.string().min(1).describe(
        "The Google CID (customer identifier) of a place. This parameter can be found in Google Maps API local results, as well as in Google Search API and Google Local API local results under the name of place_id. You can also acquire it using Google's CID converter.",
    ),
    hl: z.string().describe(
        "The language to use for the Google Local Services search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    job_type: z.string().describe(
        'The type of a job, or a subcategory of a service you have searched for. For example, if you search for "electrician", you can be more specific by adding a job_type (e.g. job_type=restore_power).',
    ).optional(),
    cid: z.string().describe(
        "A unique ID of a place. The ID is available in our Google Local Services API JSON response. Parameter is required when accessing a specific business and should be used with bid and pid parameters. Parameter should not be confused with data_cid which corresponds to Google CID (customer identifier) of a place.",
    ).optional(),
    bid: z.string().describe(
        "A unique ID of a place. The ID is available in our Google Local Services API JSON response. Parameter is required when accessing a specific business and should be used with cid and pid parameters.",
    ).optional(),
    pid: z.string().describe(
        "A unique ID of a place. The ID is available in our Google Local Services API JSON response. Parameter is required when accessing a specific business and should be used with cid and bid parameters.",
    ).optional(),
    ...serpApiParams,
});
