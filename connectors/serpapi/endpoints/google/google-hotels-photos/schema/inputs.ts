import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_hotels_photos` engine query parameters (https://serpapi.com/google-hotels-photos-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleHotelsPhotosQuery = z.strictObject({
    property_token: z.string().min(1).describe(
        "Unique identifier used to identify a Google Property. You can find property_token from Google Hotels Properties API.",
    ),
    next_page_token: z.string().describe(
        "The next page token needed to retrieve the next batch of photos of a particular section.",
    ).optional(),
    ...serpApiParams,
});
