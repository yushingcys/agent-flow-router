import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_maps_posts` engine query parameters (https://serpapi.com/google-maps-posts-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleMapsPostsQuery = z.strictObject({
    data_id: z.string().min(1).describe(
        "The Google Maps data ID. Find the data ID of a place using our Google Maps API.",
    ),
    next_page_token: z.string().describe(
        "The next page token. It is used for retrieving the next page results. 10 results are returned per page.",
    ).optional(),
    ...serpApiParams,
});
