import { z } from "zod";
import { serpApiParams, zGoogleDomain } from "../../../../schema/common.ts";

/** `google_maps` engine query parameters (https://serpapi.com/google-maps-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleMapsQuery = z.strictObject({
    q: z.string().describe(
        "The query you want to search. You can use anything that you would use in a regular Google Maps search. The parameter is only required if type is set to search.",
    ).optional(),
    ll: z.string().describe(
        "The GPS coordinates for the search origin. Its value must match the following format: @ + latitude + , + longitude + , + zoom/map_height This will form a string that looks like: @40.7455096,-74.0083012,14z or @43.8521864,11.2168835,10410m. The minimum zoom value is 3z (the map is completely zoomed out). The maximum effective zoom value depends on the location, ranging from 18z to 23z.",
    ).optional(),
    location: z.string().describe(
        "The location, whose GPS coordinates are used for the search origin. At the end, coordinates are encoded as part of the ll parameter. Parameter should be used with z or m parameter. Parameter can't be used with ll, lat or lon parameters.",
    ).optional(),
    lat: z.number().describe(
        "A GPS latitude for the search origin. At the end, it is encoded as part of the ll parameter. Parameter is required when using lon parameter. Parameter should be used with z or m parameter. Parameter can't be used with ll or location parameters.",
    ).optional(),
    lon: z.number().describe(
        "A GPS longitude for the search origin. At the end, it is encoded as part of the ll parameter. Parameter is required when using lat parameter. Parameter should be used with z or m parameter. Parameter can't be used with ll or location parameters.",
    ).optional(),
    z: z.number().describe(
        "A map zoom level. The minimum value is 3 (the map is completely zoomed out). The maximum effective value depends on the location, ranging from 18 to 23. Some locations may support even higher values, so we allow values up to 30. At the end, it is encoded as part of the ll parameter. Either z or m is required when using location or lat/lon parameters.",
    ).optional(),
    m: z.number().describe(
        "A map height in meters. The minimum value is 1. The maximum value is 15028132, which roughly equals 3z on the equator. At the end, it is encoded as part of the ll parameter. Either m or z is required when using location or lat/lon parameters.",
    ).optional(),
    nearby: z.string().describe(
        "Parameter forces to return search results closer to the specified location. Parameter is highly recommended when q parameter includes near me keywords. Parameter is not recommended when q parameter includes location. Parameter should be used with ll, location, or lat/lon parameters.",
    ).optional(),
    google_domain: zGoogleDomain.optional(),
    hl: z.string().describe(
        "The language to use for the Google Maps search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    gl: z.string().describe(
        "The country to use for the Google Maps search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France). Parameter only affects Place Results API.",
    ).optional(),
    data: z.string().describe(
        "This parameter is deprecated, please use place_id or data_cid instead. Parameter can be used to filter the search results. You can visit Google Maps website, set filters you want and simply copy the data value from their URL to SerpApi URL. One of the uses of the parameter is to search for a specific place; therefore, it is required if the type is set to place.",
    ).optional(),
    place_id: z.string().describe(
        "The unique reference to a place in Google Maps. Place IDs are available for most locations, including businesses, landmarks, parks, and intersections. You can find the place_id using our Google Maps API. You can read more about Place IDs here. place_id can be used without any other optional parameter. place_id and data_cid can't be used together.",
    ).optional(),
    data_cid: z.string().describe(
        "The Google CID (customer identifier) of a place. This parameter can be found in Google Maps API local results, as well as in Google Search API and Google Local API local results under the name of place_id. You can also acquire it using Google's CID converter. data_cid can be used without any other optional parameter. data_cid and place_id can't be used together.",
    ).optional(),
    type: z.string().describe(
        "The type of search you want to make. It can be set to: search - returns a list of results for the set q parameter, place - returns results for a specific place when data parameter is set Parameter is not required when using place_id or data_cid.",
    ).optional(),
    min_price: z.number().describe(
        "The lower bound of the place price range. The places with the price range overlapping with the specified one will be returned. Parameter is applicable to searches expected to return places with numerical price data (e.g., cafes, restaurants, bars, etc.)",
    ).optional(),
    max_price: z.number().describe(
        "The upper bound of the place price range. The places with the price range overlapping with the specified one will be returned. Parameter is applicable to searches expected to return places with numerical price data (e.g., cafes, restaurants, bars, etc.)",
    ).optional(),
    min_rating: z.string().describe(
        "The preferred minimum rating of the place. Places without a rating or with a rating below the specified value can still be returned, but with reduced relevance. Options: 2.0 - 2.0 2.5 - 2.5 3.0 - 3.0 3.5 - 3.5 4.0 - 4.0 4.5 - 4.5",
    ).optional(),
    open_state: z.string().describe(
        "The open state of the place. Options: now - Open now 24h - Open 24 hours Parameter can't be used with open_on_day or open_at_hour parameters.",
    ).optional(),
    open_on_day: z.string().describe(
        "The day on which the place is open. Options: mon - Monday tue - Tuesday wed - Wednesday thu - Thursday fri - Friday sat - Saturday sun - Sunday Parameter can't be used with open_state parameter.",
    ).optional(),
    open_at_hour: z.string().describe(
        "The hour at which the place is open. Options: 0 - Midnight 1 - 1:00 AM 2 - 2:00 AM 3 - 3:00 AM 4 - 4:00 AM 5 - 5:00 AM 6 - 6:00 AM 7 - 7:00 AM 8 - 8:00 AM 9 - 9:00 AM 10 - 10:00 AM 11 - 11:00 AM 12 - Noon 13 - 1:00 PM 14 - 2:00 PM 15 - 3:00 PM 16 - 4:00 PM 17 - 5:00 PM 18 - 6:00 PM 19 - 7:00 PM 20 - 8:00 PM 21 - 9:00 PM 22 - 10:00 PM 23 - 11:00 PM Parameter should be used with open_on_day parameter.",
    ).optional(),
    start: z.number().describe(
        "The result offset. It skips the given number of results. It's used for pagination. (e.g., 0 (default) is the first page of results, 20 is the 2nd page of results, 40 is the 3rd page of results, etc.). We recommend starting with 0 and increasing by 20 for the next page. There is no hard limit on the maximum offset number, but we recommend a maximum of 100 (page six)",
    ).optional(),
    ...serpApiParams,
});
