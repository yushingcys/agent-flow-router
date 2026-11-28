import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `expedia_hotels` engine query parameters
 *  (https://serpapi.com/expedia-hotels-api, read 2026-11-27).
 *  Mirror carries optionality only (D25). */
export const zExpediaHotelsQuery = z.strictObject({
    q: z.string().describe(
        "Destination: a city, region, neighborhood, address, or landmark (e.g., New York, Austin, TX, or Eiffel Tower). Overridden by region_id.",
    ).optional(),
    region_id: z.string().describe(
        "Expedia destination id (e.g., 2734 for Paris). Limits the search to that destination and overrides q. A previous search returns it as search_information.region_id.",
    ).optional(),
    expedia_domain: z.string().describe(
        "Expedia domain. It sets the language and default currency (e.g., expedia.com, expedia.co.uk, expedia.fr). Default expedia.com.",
    ).optional(),
    currency: z.string().describe(
        "Currency of the returned prices. Default is the domain currency (USD on expedia.com, EUR on expedia.fr).",
    ).optional(),
    check_in_date: z.string().describe(
        "Check-in date, YYYY-MM-DD (e.g., 2026-12-27). Must be used together with check_out_date. Without dates, Expedia prices a 1-night stay two weeks ahead.",
    ).optional(),
    check_out_date: z.string().describe(
        "Check-out date, YYYY-MM-DD (e.g., 2026-12-29). Must be used together with check_in_date, and be later than it.",
    ).optional(),
    adults: z.number().describe(
        "Number of adults. Default 2.",
    ).optional(),
    children_ages: z.string().describe(
        "Ages of the children, comma-separated, from 0 (under 1) to 17 (e.g., 5 or 5,9).",
    ).optional(),
    sort_by: z.string().describe(
        "Sort order. Default recommended. Options: recommended, price_low_to_high, price_high_to_low, distance, guest_rating.",
    ).optional(),
    min_price: z.number().describe(
        "Minimum nightly price, in the currency of the results.",
    ).optional(),
    max_price: z.number().describe(
        "Maximum nightly price, in the currency of the results.",
    ).optional(),
    rating: z.string().describe(
        'Minimum guest rating out of 10, as a string, not an integer. "7" good, "8" very good, "9" wonderful.',
    ).optional(),
    hotel_class: z.string().describe(
        "Property classes (stars) to show, comma-separated from 1 to 5 (e.g., 4,5).",
    ).optional(),
    stay_type: z.string().describe(
        "Type of stay. Default is any type. Options: hotels, vacation_rentals.",
    ).optional(),
    property_types: z.string().describe(
        "Property types, comma-separated (e.g., hotel,resort).",
    ).optional(),
    amenities: z.string().describe(
        "Amenities the properties must have, comma-separated (e.g., pool,wifi,parking).",
    ).optional(),
    accessibility_features: z.string().describe(
        "Accessibility features the properties must have, comma-separated (e.g., elevator,roll_in_shower).",
    ).optional(),
    meal_plans: z.string().describe(
        "Meal plans the properties must offer, comma-separated. Options include breakfast_included, lunch_included, dinner_included, all_inclusive.",
    ).optional(),
    free_cancellation: z.boolean().describe(
        "Only fully refundable properties. true, or false (default).",
    ).optional(),
    pay_later: z.boolean().describe(
        "Only properties that can be reserved now and paid later. true, or false (default).",
    ).optional(),
    page: z.number().describe(
        "Page of results. 1 (default) is the first page. Expedia returns up to 100 results per page.",
    ).optional(),
    ...serpApiParams,
});
