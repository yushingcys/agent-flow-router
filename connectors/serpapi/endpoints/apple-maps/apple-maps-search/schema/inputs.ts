import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `apple_maps` engine query parameters (https://serpapi.com/apple-maps-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zAppleMapsSearchQuery = z.strictObject({
    query: z.string().min(1).describe(
        "The query you want to search. You can use anything that you would use in a regular Apple Maps search.",
    ),
    center: z.string().describe(
        "Coordinates of the center point of the region you want to search within. You can pass the coordinates as latitude,longitude. (e.g. 30.324639,-97.7304611 for Austin, TX). Either a center or a location parameter is required. These parameters can't be used together.",
    ).optional(),
    span: z.string().describe(
        "Width and height of the search region as latitudeDelta,longitudeDelta. Smaller delta values correspond to a higher zoom level. (defaults to 0.5,0.5).",
    ).optional(),
    location: z.string().describe(
        "The GPS coordinates used for the search origin. (e.g. Austin, Texas, United States). Either a center or a location parameter is required. These parameters can't be used together.",
    ).optional(),
    sort: z.string().describe(
        "The sorting refinement for the search. Can be one of the following: distance - Sort by distance from the center/location. ratings - Sort by result ratings. default - Sort by best match for your query. This is the default.",
    ).optional(),
    toggles: z.string().describe(
        "The toggle options for the search. A comma separated list of toggle key values can be passed to this parameter. See the refinements.toggles object of the response to see available toggles for a search.",
    ).optional(),
    multi_select_options: z.string().describe(
        "The options you want to filter by for multi select refinements. A comma separated list of toggle key values can be passed to this parameter. See the refinement.multi_select.<type>.options object of the response to see available multi select refinements for the search.",
    ).optional(),
    open_at: z.string().describe(
        "The time at which result locations should be open at. The value must be a Unix timestamp that is in the future, and no more than 24 hours from the current time. (e.g. 1793110583).",
    ).optional(),
    locale: z.string().describe(
        "The locale the results should be localized for. Locales for Apple Maps are represented as <LANGUAGE>-<REGION>. (defaults to en-US, the locale for U.S. English). Head to Apple Maps Locales for the list of available locales.",
    ).optional(),
    ...serpApiParams,
});
