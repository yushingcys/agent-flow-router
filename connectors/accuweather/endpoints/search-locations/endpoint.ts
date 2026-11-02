import { defineEndpoint } from "@shared/core";
import { zSearchLocationsQuery } from "./schema/inputs.ts";

/** GET /locations/v1/search - text search over cities, postal codes, and
 *  points of interest. */
export default defineEndpoint({
    meta: {
        displayName: "Search Locations",
        summary: "Find AccuWeather locations and their location keys by " +
            "name, postal code, or point of interest.",
        description: "Search AccuWeather's location directory by city " +
            "name, postal code, or point of interest and get matching " +
            "locations ranked by importance, each with its location " +
            "`Key` (the id every weather read takes), localized and " +
            "English names, type, country, administrative area, time " +
            "zone, coordinates, and available data sets.",
        docsUrl: "https://developer.accuweather.com/core-weather/text-search",
    },
    endpoint: "/search_locations",
    request: { method: "GET", path: "/locations/v1/search" },
    input: { schema: { queryParams: zSearchLocationsQuery } },
});
