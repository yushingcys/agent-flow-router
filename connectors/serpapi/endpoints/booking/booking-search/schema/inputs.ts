import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `booking` engine query parameters (https://serpapi.com/booking-api,
 *  read 2026-11-27). Mirror carries optionality only (D25). */
export const zBookingSearchQuery = z.strictObject({
    q: z.string().min(1).describe(
        "Destination: a city, region, district, landmark, or airport (e.g., Paris, Tuscany, Manhattan, or Eiffel Tower). Booking.com does not return results for most street addresses.",
    ),
    hl: z.string().describe(
        "Language for the Booking.com search (e.g., en-us (default), fr, or pt-br).",
    ).optional(),
    currency: z.string().describe(
        "Currency of the returned prices. Default hotel_currency, the currency of each property.",
    ).optional(),
    check_in_date: z.string().describe(
        "Check-in date, YYYY-MM-DD (e.g., 2026-12-27). Must be used together with check_out_date. Without dates, properties come back without prices.",
    ).optional(),
    check_out_date: z.string().describe(
        "Check-out date, YYYY-MM-DD (e.g., 2026-12-30). Must be used together with check_in_date, and be at most 90 nights later.",
    ).optional(),
    flex_window: z.string().describe(
        'How many days the stay can move for each property\'s best price, as a string, not an integer. "1", "2", "3", or "7". Requires check_in_date and check_out_date.',
    ).optional(),
    adults: z.number().describe(
        "Number of adults, from 1 to 30. Default 2.",
    ).optional(),
    children: z.number().describe(
        "Number of children, from 0 (default) to 10. Set their ages with children_ages.",
    ).optional(),
    children_ages: z.string().describe(
        "Age of each child at check-out, from 0 to 17, comma-separated (e.g., 5 or 5,9). When children is omitted, the number of ages is the child count.",
    ).optional(),
    rooms: z.number().describe(
        "Number of rooms, from 1 (default) to 30. Cannot be greater than adults.",
    ).optional(),
    sort_by: z.string().describe(
        "Sort order. Default popularity. Options: popularity, upsort_bh, price, price_from_high_to_low, review_score_and_price, bayesian_review_score, class, class_asc, class_and_price.",
    ).optional(),
    min_price: z.number().describe(
        "Minimum price per night, in the currency of the results. Must be used with a currency code.",
    ).optional(),
    max_price: z.number().describe(
        "Maximum price per night, in the currency of the results. Must be used with a currency code.",
    ).optional(),
    hotel_class: z.string().describe(
        "Property ratings to show, comma-separated from 1 to 5 (e.g., 4,5). Half-star properties are included with the rating below them.",
    ).optional(),
    rating: z.string().describe(
        'Minimum review score as a string, not an integer. "9" wonderful, "8" very good, "7" good, "6" pleasant.',
    ).optional(),
    free_cancellation: z.boolean().describe(
        "Only properties with free cancellation. true, or false (default).",
    ).optional(),
    property_types: z.string().describe(
        "Property type IDs, comma-separated (e.g., 204 for hotels, or 201,220 for apartments and vacation homes).",
    ).optional(),
    nflt: z.string().describe(
        "Other Booking.com filters (amenities, meals, districts, brands, distance). Semicolon-separated, as in a Booking.com search URL (e.g., hotelfacility=107;mealplan=1).",
    ).optional(),
    offset: z.number().describe(
        "Results to skip. 0 (default) is the first page. Up to 1000.",
    ).optional(),
    limit: z.number().describe(
        "Maximum results to return, from 1 to 100. Default 25.",
    ).optional(),
    session_token: z.string().describe(
        "Token that keeps the same Booking.com visitor between pages, from serpapi_pagination.session_token. Without it, later pages can repeat earlier properties.",
    ).optional(),
    ...serpApiParams,
});
