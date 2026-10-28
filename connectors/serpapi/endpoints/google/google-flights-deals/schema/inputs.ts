import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_flights_deals` engine query parameters (https://serpapi.com/google-flights-deals-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleFlightsDealsQuery = z.strictObject({
    departure_id: z.string().describe(
        'The departure airport code or location kgmid. An airport code is an uppercase 3-letter code. You can search for it using our Google Flights Autocomplete API or IATA. For example, CDG is Paris Charles de Gaulle Airport and AUS is Austin-Bergstrom International Airport. A location kgmid is a string that starts with /m/ or /g/. You can search for a location on Wikidata and use its "Freebase ID" as the location kgmid.',
    ).optional(),
    gl: z.string().describe(
        "The country to use for the Google Flights Deals search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France)",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google Flights Deals search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    currency: z.string().describe(
        "The currency of the returned prices. Default to USD.",
    ).optional(),
    query: z.string().describe(
        "The natural language query for Google Flights Deals. e.g. High rises, beach vacation next month. Cannot be combined with travel_duration or trip_length. Describe the trip duration in query instead.",
    ).optional(),
    type: z.string().describe(
        "The type of the flights. Available options: 1 - Round trip (default) 2 - One way",
    ).optional(),
    travel_class: z.string().describe(
        "The travel class. Available options: 1 - Economy (default) 2 - Premium economy 3 - Business 4 - First",
    ).optional(),
    outbound_date: z.string().describe(
        "When you want to depart. Use a single YYYY-MM-DD date for an exact departure date, or two comma-separated dates for a flexible departure window. Examples: 2026-10-28 — depart on this exact date 2026-10-28,2026-11-26 — depart anytime within this window With a single date: return_date (single date) is required for round trip flights.",
    ).optional(),
    return_date: z.string().describe(
        "When you want to return. Use a single YYYY-MM-DD date for an exact return date, or two comma-separated dates for a flexible return window. Examples: 2026-11-03 — return on this exact date (use with a single outbound_date) 2026-11-03,2026-12-03 — return anytime within this window (use with a range outbound_date) Not available for one-way flights (type = 2).",
    ).optional(),
    travel_duration: z.string().describe(
        "A preset trip duration when searching with flexible dates. Available options: 1 - 1 week (default) 2 - Weekend 3 - 2 weeks Can be used alone (deals of this duration, any departure date) or with outbound_date as a date range (e.g., 2026-10-28,2026-11-26) to limit the departure window. Cannot be combined with return_date, trip_length, or query. Not available for one-way flights (type = 2).",
    ).optional(),
    trip_length: z.string().describe(
        "A custom trip length in days when searching with flexible dates. Provide a single number for an exact duration, or two comma-separated numbers for a min/max range. Examples: 7 — exactly 7 days 5,10 — between 5 and 10 days Can be used alone (deals of this length, any departure date) or with outbound_date as a date range (e.g., 2026-10-28,2026-11-26) to limit the departure window.",
    ).optional(),
    adults: z.number().describe(
        "The number of adults. Default to 1.",
    ).optional(),
    children: z.number().describe(
        "The number of children. Default to 0.",
    ).optional(),
    infants_in_seat: z.number().describe(
        "The number of infants in seat. Default to 0.",
    ).optional(),
    infants_on_lap: z.number().describe(
        "The number of infants on lap. Default to 0.",
    ).optional(),
    stops: z.string().describe(
        "The number of stops during the flight. Available options: 0 - Any number of stops (default) 1 - Nonstop only 2 - 1 stop or fewer 3 - 2 stops or fewer",
    ).optional(),
    exclude_airlines: z.string().describe(
        "The airline codes to be excluded. Split multiple airlines with comma. It can't be used together with include_airlines. Each airline code should be a 2-character IATA code consisting of either two uppercase letters or one uppercase letter and one digit. You can search for airline codes on IATA. For example, UA is United Airlines.",
    ).optional(),
    include_airlines: z.string().describe(
        "The airline codes to be included. Split multiple airlines with comma. It can't be used together with exclude_airlines. Each airline code should be a 2-character IATA code consisting of either two uppercase letters or one uppercase letter and one digit. You can search for airline codes on IATA. For example, UA is United Airlines.",
    ).optional(),
    max_price: z.number().describe(
        "The maximum ticket price. Default to unlimited.",
    ).optional(),
    max_duration: z.string().describe(
        "The maximum flight duration, in minutes. For example, specify 1500 for 25 hours. If your search returns no results, try increasing your max_duration by up to 200 minutes to account for route-specific scheduling variances.",
    ).optional(),
    ...serpApiParams,
});
