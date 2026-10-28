import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_maps_directions` engine query parameters (https://serpapi.com/google-maps-directions-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleMapsDirectionsQuery = z.strictObject({
    start_addr: z.string().describe(
        "The address of the starting point for the direction you want to search. You can use anything that you would use in a regular Google Maps Directions search. Alternatively, you can use start_data_id or start_coords.",
    ).optional(),
    end_addr: z.string().describe(
        "The address of the ending point for the direction you want to search. You can use anything that you would use in a regular Google Maps Directions search. Alternatively, you can use end_data_id or end_coords.",
    ).optional(),
    gl: z.string().describe(
        "The country to use for the Google search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France)",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google Maps Directions search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    travel_mode: z.string().describe(
        "The travel mode. Available options: 6 - Best (Default) 0 - Driving 9 - Two-wheeler 3 - Transit 2 - Walking 1 - Cycling 4 - Flight",
    ).optional(),
    start_data_id: z.string().describe(
        "The data ID of the starting point for the direction you want to search. Find the data ID of a place using our Google Maps API. Alternatively, you can use start_addr or start_coords.",
    ).optional(),
    end_data_id: z.string().describe(
        "The data ID of the ending point for the direction you want to search. Find the data ID of a place using our Google Maps API. Alternatively, you can use end_addr or end_coords.",
    ).optional(),
    start_coords: z.string().describe(
        "The GPS coordinates of the starting point for the direction you want to search. The format is latitude,longitude. E.g. 30.197471099,-97.66635289. Alternatively, you can use start_addr or start_data_id.",
    ).optional(),
    end_coords: z.string().describe(
        "The GPS coordinates of the ending point for the direction you want to search. The format is latitude,longitude. E.g. 30.197471099,-97.66635289. Alternatively, you can use end_addr or end_data_id.",
    ).optional(),
    distance_unit: z.string().describe(
        "The displayed distance unit. Available options: 1 - miles 0 - km",
    ).optional(),
    avoid: z.string().describe(
        "Avoid options. Available options: highways - Highways tolls - Tolls ferries - Ferries You can also combine multiple options by joining them with a comma (e.g.: highways,tolls).",
    ).optional(),
    prefer: z.string().describe(
        "Preferred transit options. Available options: bus - Bus subway - Subway train - Train tram_light_rail - Tram and light rail You can also combine multiple options by joining them with a comma (e.g.: subway,train). Parameter works only if travel_mode parameter is set to: 3 (Transit)",
    ).optional(),
    route: z.string().describe(
        "Route options. Available options: 2 - Fewer transfers 3 - Less walking 4 - Wheelchair accessible Parameter works only if travel_mode parameter is set to: 3 (Transit)",
    ).optional(),
    time: z.string().describe(
        "The time to travel. Available options: depart_at:xxxxxx - Specifies the departure time, where xxxxxx is the timestamp. E.g. depart_at:1698229538 specifies the departure time to 2023-10-25 10:25:38 GMT+0000 arrive_by:xxxxxx - Specifies the arrival time, where xxxxxx is the timestamp. E.g. arrive_by:1698229538 specifies the arrival time to 2023-10-25 10:25:38 GMT+0000 last_available - Takes the last available transit.",
    ).optional(),
    ...serpApiParams,
});
