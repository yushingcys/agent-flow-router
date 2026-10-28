import { z } from "zod";
import { serpApiParams, zLocation, zUule } from "../../../../schema/common.ts";

/** `google_events` engine query parameters (https://serpapi.com/google-events-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleEventsQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The query you want to search. To search for events in a specific location, just include the location inside your search query (e.g. Events in Austin, TX).",
    ),
    location: zLocation.optional(),
    uule: zUule.optional(),
    ...serpApiParams,
});
