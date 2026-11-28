import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_flights_calendar` engine query parameters
 *  (https://serpapi.com/google-flights-calendar-api, read 2026-11-27).
 *  Mirror carries optionality only (D25). Coded filters are strings. */
export const zGoogleFlightsCalendarQuery = z.strictObject({
    departure_id: z.string().min(1).describe(
        "Departure airport code (uppercase IATA, such as AUS) or location kgmid (a string starting with /m/).",
    ),
    arrival_id: z.string().min(1).describe(
        "Arrival airport code (uppercase IATA, such as CDG) or location kgmid (a string starting with /m/).",
    ),
    gl: z.string().describe(
        "Country for the Google Flights search, as a two-letter code (e.g., us, uk, fr).",
    ).optional(),
    hl: z.string().describe(
        "Language for the Google Flights search, as a two-letter code (e.g., en, es, fr).",
    ).optional(),
    currency: z.string().describe(
        "Currency of the returned prices. Default USD.",
    ).optional(),
    type: z.string().describe(
        'Flight type as a string, not an integer. "1" round trip (default), "2" one way.',
    ).optional(),
    date_range_start: z.string().describe(
        "Start of the date range, YYYY-MM-DD. Default is today's date. When fixed_outbound_date is true, this is also the outbound date.",
    ).optional(),
    date_range_end: z.string().describe(
        "End of the date range, YYYY-MM-DD (e.g., 2026-12-31). Default is the end of next month.",
    ).optional(),
    round_trip_days: z.number().describe(
        'Length of the round trip in days. Default 7. Only with type "1". Cannot be combined with fixed_outbound_date.',
    ).optional(),
    fixed_outbound_date: z.boolean().describe(
        'When true, depart on date_range_start and price each return date in the range. When false (default), price each outbound date with a trip of round_trip_days. Only with type "1". Cannot be combined with round_trip_days.',
    ).optional(),
    travel_class: z.string().describe(
        'Travel class as a string, not an integer. "1" economy (default), "2" premium economy, "3" business, "4" first.',
    ).optional(),
    adults: z.number().describe(
        "Number of adults. Default 1.",
    ).optional(),
    children: z.number().describe(
        "Number of children. Default 0.",
    ).optional(),
    infants_in_seat: z.number().describe(
        "Number of infants in seat. Default 0.",
    ).optional(),
    infants_on_lap: z.number().describe(
        "Number of infants on lap. Default 0.",
    ).optional(),
    stops: z.string().describe(
        'Stops as a string, not an integer. "0" any number of stops (default), "1" nonstop only, "2" 1 stop or fewer, "3" 2 stops or fewer.',
    ).optional(),
    exclude_airlines: z.string().describe(
        "Airline or alliance codes to exclude, comma-separated. Each airline is a 2-character IATA code (e.g., UA). Alliances: STAR_ALLIANCE, SKYTEAM, ONEWORLD. Cannot be combined with include_airlines.",
    ).optional(),
    include_airlines: z.string().describe(
        "Airline or alliance codes to include, comma-separated. Each airline is a 2-character IATA code (e.g., UA). Alliances: STAR_ALLIANCE, SKYTEAM, ONEWORLD. Cannot be combined with exclude_airlines.",
    ).optional(),
    outbound_times: z.string().describe(
        "Outbound time window. Two or four comma-separated hours (departure, or departure and arrival). Example: 4,18 is 4:00 AM-7:00 PM departure.",
    ).optional(),
    return_times: z.string().describe(
        "Return time window. Two or four comma-separated hours (departure, or departure and arrival). Example: 4,18 is 4:00 AM-7:00 PM departure.",
    ).optional(),
    ...serpApiParams,
});
