import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `apple_maps_places` engine query parameters (https://serpapi.com/apple-maps-places-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zAppleMapsPlaceQuery = z.strictObject({
    muid: z.string().min(1).describe(
        "The MUID of the place you want to search. You can use the MUID from the Apple Maps Places API response. (e.g. 18366846785603624515 for London). You can also pass multiple MUIDs separated by commas (e.g., 18366846785603624515,11018610862491969006 to get London and Austin). Upto 50 MUIDs can be fetched in a single request.",
    ),
    locale: z.string().describe(
        "The locale the results should be localized for. Locales for Apple Maps are represented as <LANGUAGE>-<REGION>. (defaults to en-US, the locale for U.S. English). Head to Apple Maps Locales for the list of available locales.",
    ).optional(),
    ...serpApiParams,
});
