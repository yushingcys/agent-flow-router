import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `instagram_profile` engine query parameters (https://serpapi.com/instagram-profile-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zInstagramProfileQuery = z.strictObject({
    profile_id: z.string().min(1).describe(
        "The Instagram profile ID. You can find it in the URL of the profile page. For example, in https://www.instagram.com/serpapicom, the profile ID is serpapicom.",
    ),
    next_page_token: z.string().describe(
        "The next page token. It is used for retrieving the next page results. The next page token can be found in the SerpApi JSON response: serpapi_pagination -> next_page_token",
    ).optional(),
    ...serpApiParams,
});
