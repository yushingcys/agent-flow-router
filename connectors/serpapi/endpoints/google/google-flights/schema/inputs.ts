import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_flights` engine query parameters (https://serpapi.com/google-flights-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleFlightsQuery = z.strictObject({
    departure_id: z.string().describe(
        'The departure airport code or location kgmid. An airport code is an uppercase 3-letter code. You can search for it on Google Flights or IATA. For example, CDG is Paris Charles de Gaulle Airport and AUS is Austin-Bergstrom International Airport. A location kgmid is a string that starts with /m/ or /g/. You can search for a location on Wikidata and use its "Freebase ID" as the location kgmid.',
    ).optional(),
    arrival_id: z.string().describe(
        'The arrival airport code or location kgmid. An airport code is an uppercase 3-letter code. You can search for it on Google Flights or IATA. For example, CDG is Paris Charles de Gaulle Airport and AUS is Austin-Bergstrom International Airport. A location kgmid is a string that starts with /m/ or /g/. You can search for a location on Wikidata and use its "Freebase ID" as the location kgmid.',
    ).optional(),
    gl: z.string().describe(
        "The country to use for the Google Flights search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France)",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google Flights search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    currency: z.string().describe(
        "The currency of the returned prices. Default to USD.",
    ).optional(),
    type: z.string().describe(
        "The type of the flights. Available options: 1 - Round trip (default) 2 - One way 3 - Multi-city When this parameter is set to 3, use multi_city_json to set the flight information. To obtain the returning flight information for Round Trip (1), you need to make another request using a departure_token.",
    ).optional(),
    outbound_date: z.string().describe(
        "The outbound date. The format is YYYY-MM-DD. e.g. 2026-10-28 Parameter is required when type is 1 (Round trip) or 2 (One way), unless selected_flights_json is used. Parameter can't be used when type is 3 (Multi-city). Use date inside multi_city_json instead.",
    ).optional(),
    return_date: z.string().describe(
        "The return date. The format is YYYY-MM-DD. e.g. 2026-11-03 Parameter is required when type is 1 (Round trip), unless selected_flights_json is used. Parameter can't be used when type is 2 (One way) or 3 (Multi-city).",
    ).optional(),
    travel_class: z.string().describe(
        "The travel class. Available options: 1 - Economy (default) 2 - Premium economy 3 - Business 4 - First",
    ).optional(),
    multi_city_json: z.string().describe(
        "The flight information for multi-city flights. It's a JSON string containing multiple flight information objects. Each object should contain the following fields: departure_id - The departure airport code or location kgmid. The format is the same as the main departure_id parameter. arrival_id - The arrival airport code or location kgmid. The format is the same as the main arrival_id parameter. date - Flight date.",
    ).optional(),
    show_hidden: z.boolean().describe(
        "Set to true to include the hidden flight results. This is equivalent to clicking 'View more flights' on Google Flights. Default to false.",
    ).optional(),
    exclude_basic: z.boolean().describe(
        "Set to true to exclude basic results. Resulting fares will have free seat selection and carry on bags. Default to false. As of now, this filter only works for domestic flights in the US. Parameter can only be used when gl isus and travel_class is1",
    ).optional(),
    deep_search: z.boolean().describe(
        "Set to true to enable deep search, which may yield better results but with a longer response time. Deep search results are identical to those found on Google Flights pages in the browser. By default, this option is set to false for performance reasons.",
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
    sort_by: z.string().describe(
        "The sorting order of the results. Available options: 1 - Top flights (default) 2 - Price 3 - Departure time 4 - Arrival time 5 - Duration 6 - Emissions",
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
    bags: z.number().describe(
        "The number of carry-on bags. Default to 0. Parameter should not exceed the total number of passengers with carry-on bag allowance (adults, children and infants_in_seat).",
    ).optional(),
    max_price: z.number().describe(
        "The maximum ticket price. Default to unlimited.",
    ).optional(),
    outbound_times: z.string().describe(
        "The outbound times range. It's a string containing two (for departure only) or four (for departure and arrival) comma-separated numbers. Each number represents the beginning of an hour.",
    ).optional(),
    return_times: z.string().describe(
        "The return times range. It's a string containing two (for departure only) or four (for departure and arrival) comma-separated numbers. Each number represents the beginning of an hour.",
    ).optional(),
    emissions: z.string().describe(
        "The emission level of the flight. Available options: 1 - Less emissions only",
    ).optional(),
    layover_duration: z.string().describe(
        "The layover duration, in minutes. It's a string containing two comma-separated numbers. For example, specify 90,330 for 1 hr 30 min - 5 hr 30 min.",
    ).optional(),
    exclude_conns: z.string().describe(
        "The connecting airport codes to be excluded. An airport ID is an uppercase 3-letter code. You can search for it on Google Flights or IATA. For example, CDG is Paris Charles de Gaulle Airport and AUS is Austin-Bergstrom International Airport. You can also combine multiple Airports by joining them with a comma (value + , + value; eg: CDG,AUS).",
    ).optional(),
    max_duration: z.string().describe(
        "The maximum flight duration, in minutes. For example, specify 1500 for 25 hours. If your search returns no results, try increasing your max_duration by up to 200 minutes to account for route-specific scheduling variances.",
    ).optional(),
    selected_flights_json: z.string().describe(
        "Parameter pins the itinerary to specific flights, segment by segment. It's a JSON object with an outbound key (required) and a return key (required for round-trip, forbidden for one-way). Each value is an ordered array of flight segment objects, each containing: flight_number - IATA flight number (2-character airline code + 1–4 digits, e.g. BA591).",
    ).optional(),
    departure_token: z.string().describe(
        "Parameter is used to select the flight and get returning flights (for Round trip) or flights for the next leg of itinerary (for Multi-city). Find this token in the departure flight results. It cannot be used together with booking_token.",
    ).optional(),
    booking_token: z.string().describe(
        'Parameter is used to get booking options for the selected flights. Find this token in the flight results. It cannot be used together with departure_token. When using this token, parameters related to date and parameters inside "Advanced Filters" section won\'t affect the result.',
    ).optional(),
    ...serpApiParams,
});
