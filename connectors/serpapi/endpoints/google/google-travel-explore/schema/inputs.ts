import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_travel_explore` engine query parameters (https://serpapi.com/google-travel-explore-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleTravelExploreQuery = z.strictObject({
    departure_id: z.string().min(1).describe(
        'The departure airport code or city location kgmid. An airport code is an uppercase 3-letter code. You can search for it on Google Flights or IATA. For example, CDG is Paris Charles de Gaulle Airport and AUS is Austin-Bergstrom International Airport. A location kgmid is a string that starts with /m/ or /g/. You can search for a location on Wikidata and use its "Freebase ID" as the location kgmid.',
    ),
    gl: z.string().describe(
        "The country to use for the Google Travel Explore search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France)",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google Travel Explore search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    currency: z.string().describe(
        "The currency of the returned prices. Default to USD.",
    ).optional(),
    arrival_area_id: z.string().describe(
        'The arrival region or country as a location kgmid. A location kgmid is a string that starts with /m/ or /g/. You can search for a region or country on Wikidata and use its "Freebase ID" as the location kgmid. For example, /m/02j9z is the location kgmid for Europe, and /m/0f8l9c is the location kgmid for France. This parameter is used when exploring flights to broader areas (regions or countries)',
    ).optional(),
    arrival_id: z.string().describe(
        'The arrival airport code or city location kgmid. An airport code is an uppercase 3-letter code. You can search for it on Google Flights or IATA. For example, CDG is Paris Charles de Gaulle Airport and AUS is Austin-Bergstrom International Airport. A location kgmid is a string that starts with /m/ or /g/. You can search for a location on Wikidata and use its "Freebase ID" as the location kgmid.',
    ).optional(),
    type: z.string().describe(
        "The type of the flights. Available options: 1 - Round trip (default) 2 - One way When this parameter is set to 3, use multi_city_json to set the flight information.",
    ).optional(),
    outbound_date: z.string().describe(
        "The outbound date. The format is YYYY-MM-DD. e.g. 2026-10-28",
    ).optional(),
    return_date: z.string().describe(
        "The return date. The format is YYYY-MM-DD. e.g. 2026-11-03 Parameter is required if type parameter is set to: 1 (Round trip)",
    ).optional(),
    month: z.string().describe(
        "The month of the trip with flexible travel dates. The value must be a number from 1 to 12, where 1 = January, 2 = February, …, 12 = December. 0 (default) means all months within the next 6 months are considered. Only the next 6 months from the current date are available for selection.",
    ).optional(),
    travel_duration: z.string().describe(
        "The duration of the trip with flexible travel dates. Available options: 1 - Weekend 2 - 1 week (default) 3 - 2 weeks",
    ).optional(),
    travel_class: z.string().describe(
        "The travel class. Available options: 1 - Economy (default) 2 - Premium economy 3 - Business 4 - First",
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
    travel_mode: z.string().describe(
        "The travel mode. Available options: 0 - All (default) 1 - Flight only travel_mode and interest parameters can't be used together.",
    ).optional(),
    interest: z.string().describe(
        "The interest of the destination. Available options: 0 - Popular (default) /g/11bc58l13w - Outdoors /m/0b3yr - Beaches /m/09cmq - Museum /m/03g3w - History /m/071k0 - Skiing travel_mode and interest parameters can't be used together.",
    ).optional(),
    include_airlines: z.string().describe(
        "The airline codes to be included. Split multiple airlines with a comma. Each airline code should be a 2-character IATA code consisting of either two uppercase letters or one uppercase letter and one digit. You can search for airline codes on IATA. For example, UA is United Airlines.",
    ).optional(),
    exclude_airlines: z.string().describe(
        "The airline codes to be excluded. Split multiple airlines with a comma. Each airline code should be a 2-character IATA code consisting of either two uppercase letters or one uppercase letter and one digit. You can search for airline codes on IATA. For example, UA is United Airlines.",
    ).optional(),
    bags: z.number().describe(
        "The number of carry-on bags. Default to 0. Parameter should not exceed the total number of passengers with carry-on bag allowance (adults, children and infants_in_seat).",
    ).optional(),
    max_price: z.number().describe(
        "The maximum ticket price. Default to unlimited.",
    ).optional(),
    max_duration: z.string().describe(
        "The maximum flight duration, in minutes. For example, specify 1500 for 25 hours. If your search returns no results, try increasing your max_duration by up to 200 minutes to account for route-specific scheduling variances.",
    ).optional(),
    ...serpApiParams,
});
