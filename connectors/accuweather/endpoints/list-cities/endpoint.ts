import { defineEndpoint } from "@shared/core";
import { zListCitiesPath, zListCitiesQuery } from "./schema/inputs.ts";

/** GET /locations/v1/topcities/{group} - the world's top cities. */
export default defineEndpoint({
    meta: {
        displayName: "List Top Cities",
        summary: "List the world's 50, 100, or 150 largest cities with " +
            "their AccuWeather location keys.",
        description: "List the top 50, 100, or 150 cities worldwide, each " +
            "with its AccuWeather location `Key`, names, country, " +
            "administrative area, time zone, and coordinates.",
        docsUrl: "https://developer.accuweather.com/core-weather/list",
    },
    endpoint: "/list_cities",
    request: { method: "GET", path: "/locations/v1/topcities/{group}" },
    input: {
        schema: { pathParams: zListCitiesPath, queryParams: zListCitiesQuery },
    },
});
