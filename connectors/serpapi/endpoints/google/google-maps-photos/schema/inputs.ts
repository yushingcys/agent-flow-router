import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_maps_photos` engine query parameters (https://serpapi.com/google-maps-photos-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleMapsPhotosQuery = z.strictObject({
    data_id: z.string().min(1).describe(
        "The Google Maps data ID. Find the data ID of a place using our Google Maps API.",
    ),
    hl: z.string().describe(
        "The language to use for the Google Maps Photos search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    category_id: z.string().describe(
        "The ID of a category. You can find the value of an ID inside the categories array, using our Google Maps Photos API. The number, and the type of categories can vary between places.",
    ).optional(),
    next_page_token: z.string().describe(
        "The next page token. It is used for retrieving the next page results. 20 results are returned per page.",
    ).optional(),
    ...serpApiParams,
});
