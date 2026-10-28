import { z } from "zod";
import {
    serpApiParams,
    zDevice,
    zGoogleDomain,
    zLocation,
    zUule,
} from "../../../../schema/common.ts";

/** `google_local` engine query parameters (https://serpapi.com/google-local-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleLocalQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The query you want to search. You can use anything that you would use in a regular Google Local search.",
    ),
    location: zLocation.optional(),
    uule: zUule.optional(),
    google_domain: zGoogleDomain.optional(),
    gl: z.string().describe(
        "The country to use for the Google Local search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France)",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google Local search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    ludocid: z.string().describe(
        'The Google CID (customer identifier) of a place. This parameter can be found in Google Local API and Google Search API local results under the name of place_id, as well as in Google Maps API local results under the name of data_cid. You can also acquire it using Google\'s CID converter. Example CID for "New York, NY, USA": 14414772292044717666.',
    ).optional(),
    tbs: z.string().describe(
        "(to be searched) parameter defines advanced search parameters that aren't possible in the regular query field.",
    ).optional(),
    start: z.number().describe(
        "The result offset. It skips the given number of results. It's used for pagination. The value depends on the number of results returned which can either be 10 or 20. For eg, on mobile 10 results are returned, so start should be 10, 20, 30. It's advised to use serpapi_pagination.next where we handle this automatically.",
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
