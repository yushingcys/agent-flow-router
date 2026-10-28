import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_hotels` engine query parameters (https://serpapi.com/google-hotels-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleHotelsQuery = z.strictObject({
    q: z.string().describe(
        "The search query. You can use anything that you would use in a regular Google Hotels search. Parameter isn't required when using property_token, and is ignored if both are set.",
    ).optional(),
    gl: z.string().describe(
        "The country to use for the Google Hotels search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France)",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google Hotels search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    currency: z.string().describe(
        "The currency of the returned prices. Default to USD.",
    ).optional(),
    check_in_date: z.string().min(1).describe(
        "The check-in date. The format is YYYY-MM-DD. e.g. 2026-10-28",
    ),
    check_out_date: z.string().min(1).describe(
        "The check-out date. The format is YYYY-MM-DD. e.g. 2026-10-29",
    ),
    adults: z.number().describe(
        "The number of adults. Default to 2.",
    ).optional(),
    children: z.number().describe(
        "The number of children. Default to 0.",
    ).optional(),
    children_ages: z.string().describe(
        "The ages of children. The age range is from 1 to 17, with children who haven't reached 1 year old being considered as 1. Example for single child only: 5 Example for multiple children (separated by comma ,): 5,8,10 The number of children's ages specified must match the children.",
    ).optional(),
    sort_by: z.string().describe(
        "Sorting the results. Default is sort by Relevance. Available options: 3 - Lowest price 8 - Highest rating 13 - Most reviewed",
    ).optional(),
    min_price: z.number().describe(
        "The lower bound of price range.",
    ).optional(),
    max_price: z.number().describe(
        "The upper bound of price range.",
    ).optional(),
    property_types: z.string().describe(
        "To include only certain type of property in the results. For Vacation Rentals, please refer to the Google Vacation Rentals Property Types page for a full list of supported Vacation Rentals property types. Example for single property type only: 17 Example for multiple property types (separated by comma ,): 17,12,18",
    ).optional(),
    amenities: z.string().describe(
        "To include only results that offer specified amenities. For Vacation Rentals, please refer to the Google Vacation Rentals Amenities page for a full list of supported Vacation Rentals amenities. Example for single amenity only: 35 Example for multiple amenities (separated by comma ,): 35,9,19",
    ).optional(),
    rating: z.string().describe(
        "Filtering the results to certain rating. Available options: 7 - 3.5+ 8 - 4.0+ 9 - 4.5+",
    ).optional(),
    brands: z.string().describe(
        "The brands where you want your search to be concentrated. ID values are accessible inside brands array, located in our JSON output (e.g. brands[0].id). Example for single brand only: 33 Example for multiple brands (separated by comma ,): 33,67,101 This parameter isn't available for Vacation Rentals.",
    ).optional(),
    hotel_class: z.string().describe(
        "To include only certain hotel class in the results. Available options: 2 - 2-star 3 - 3-star 4 - 4-star 5 - 5-star Example for single hotel class only: 2 Example for multiple hotel class (separated by comma ,): 2,3,4 This parameter isn't available for Vacation Rentals.",
    ).optional(),
    free_cancellation: z.string().describe(
        "To show results that offer free cancellation. This parameter isn't available for Vacation Rentals.",
    ).optional(),
    special_offers: z.string().describe(
        "To show results that have special offers. This parameter isn't available for Vacation Rentals.",
    ).optional(),
    eco_certified: z.string().describe(
        "To show results that are eco certified. This parameter isn't available for Vacation Rentals.",
    ).optional(),
    vacation_rentals: z.string().describe(
        "To search for Vacation Rentals results. Default search is for Hotels.",
    ).optional(),
    bedrooms: z.number().describe(
        "The minimum number of bedrooms. Default to 0. This parameter only available for Vacation Rentals.",
    ).optional(),
    bathrooms: z.number().describe(
        "The minimum number of bathrooms. Default to 0. This parameter only available for Vacation Rentals.",
    ).optional(),
    next_page_token: z.string().describe(
        "The next page token. It is used for retrieving the next page results.",
    ).optional(),
    property_token: z.string().describe(
        "Parameter is used to get property details which consists of name, address, phone, prices, nearby places, and etc. You can find property_token from Google Hotels Properties API. Parameter can be used without q. If both are set, q is ignored.",
    ).optional(),
    ...serpApiParams,
});
