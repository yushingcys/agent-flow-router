import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `facebook_profile` engine query parameters (https://serpapi.com/facebook-profile-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zFacebookProfileQuery = z.strictObject({
    profile_id: z.string().min(1).describe(
        "The Facebook profile ID. You can find it in the URL of the profile page. For example, in https://www.facebook.com/Meta, the profile ID is Meta; in https://facebook.com/profile.php?id=100080376596424, the profile ID is 100080376596424.",
    ),
    ...serpApiParams,
});
