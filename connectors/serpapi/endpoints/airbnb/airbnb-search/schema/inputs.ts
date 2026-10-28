import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `airbnb` engine query parameters (https://serpapi.com/airbnb-search-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zAirbnbSearchQuery = z.strictObject({
    q: z.string().describe(
        "The destination to search for. You can use anything that you would use in a regular Airbnb search: a city, a region, a neighborhood, an address, or a landmark (e.g., Austin, TX, Lake Tahoe, or Paris, France). Either q or map_bounds should be set.",
    ).optional(),
    map_bounds: z.string().describe(
        "The GPS coordinates of the map area to search in, like moving the map on Airbnb. Only places within these bounds are shown. Its value must be 4 comma-separated numbers matching the following format: north + , + east + , + south + , + west north and south are latitudes, and east and west are longitudes (e.g., 30.30,-97.70,30.24,-97.78 for Downtown Austin, TX). Either q or map_bounds should be set.",
    ).optional(),
    airbnb_domain: z.string().describe(
        "The Airbnb domain to use. The domain sets the language, the region, and the default currency of the results (e.g., airbnb.co.uk for English (United Kingdom) in GBP, or fr.airbnb.ca for French (Canada) in CAD). It defaults to airbnb.com.",
    ).optional(),
    currency: z.string().describe(
        "The currency of the returned prices. It defaults to the currency of the Airbnb domain (e.g., USD for airbnb.com, or EUR for airbnb.fr).",
    ).optional(),
    check_in_date: z.string().describe(
        "The check-in date. The format is YYYY-MM-DD (e.g., 2026-11-27). It must be used together with check_out_date. When dates aren't set, Airbnb suggests dates for each place (usually a 5-night stay), and returns prices for these dates. They are available in check_in_date and check_out_date of each result.",
    ).optional(),
    check_out_date: z.string().describe(
        "The check-out date. The format is YYYY-MM-DD (e.g., 2026-12-01). It must be used together with check_in_date, and be later than it.",
    ).optional(),
    adults: z.number().describe(
        "The number of adults (ages 13 or above).",
    ).optional(),
    children: z.number().describe(
        "The number of children (ages 2 to 12).",
    ).optional(),
    infants: z.number().describe(
        "The number of infants (under 2).",
    ).optional(),
    pets: z.number().describe(
        "The number of pets. When set, only places allowing pets are shown.",
    ).optional(),
    room_type: z.string().describe(
        "The type of place to show. It defaults to any type. Available options: entire_home - Entire home private_room - Private room To only show hotels, use hotel in property_types.",
    ).optional(),
    min_price: z.number().describe(
        "The minimum trip price, including all fees, like Airbnb's price range filter (e.g., 500). It's in the currency of the results. When dates aren't set, it applies to a 5-night stay.",
    ).optional(),
    max_price: z.number().describe(
        "The maximum trip price, including all fees, like Airbnb's price range filter (e.g., 2000). It's in the currency of the results. When dates aren't set, it applies to a 5-night stay.",
    ).optional(),
    bedrooms: z.number().describe(
        "The minimum number of bedrooms.",
    ).optional(),
    beds: z.number().describe(
        "The minimum number of beds.",
    ).optional(),
    bathrooms: z.number().describe(
        "The minimum number of bathrooms.",
    ).optional(),
    property_types: z.string().describe(
        "The property types to show. It's a comma-separated list of options (e.g., house,guesthouse). Available options: house - House apartment - Apartment guesthouse - Guesthouse hotel - Hotel",
    ).optional(),
    amenities: z.string().describe(
        "The amenities the places must have. It's a comma-separated list of options (e.g., wifi,pool,free_parking).",
    ).optional(),
    accessibility_features: z.string().describe(
        "The accessibility features the places must have. It's a comma-separated list of options (e.g., step_free_access,step_free_shower).",
    ).optional(),
    host_languages: z.string().describe(
        "The languages the host must speak. It's a comma-separated list of language codes (e.g., en,es).",
    ).optional(),
    instant_book: z.boolean().describe(
        "Whether to only show places that can be booked without waiting for the host's approval. It can be set to true or false (default).",
    ).optional(),
    self_check_in: z.boolean().describe(
        "Whether to only show places with self check-in. It can be set to true or false (default).",
    ).optional(),
    guest_favorite: z.boolean().describe(
        "Whether to only show Guest favorites, the most loved homes on Airbnb according to guests. It can be set to true or false (default).",
    ).optional(),
    luxe: z.boolean().describe(
        "Whether to only show Airbnb Luxe places, luxury homes with elevated design. It can be set to true or false (default).",
    ).optional(),
    page: z.number().describe(
        "Value is used to get results on a specific page. (e.g., 1 (default) is the first page of results, 2 is the 2nd page of results, 3 is the 3rd page of results, etc.). Airbnb returns up to 18 results per page, and up to 15 pages.",
    ).optional(),
    ...serpApiParams,
});
