import { defineEndpoint } from "@shared/core";
import { zCityQuery } from "./schema/inputs.ts";

/** GET /v2/city - one city's current air quality and weather. */
export default defineEndpoint({
    meta: {
        displayName: "Get City Air Quality",
        summary: "Current AQI, main pollutant, and weather for a city.",
        description: "Read a city's current air quality (US AQI and China " +
            "AQI with their main pollutants, plus per-pollutant " +
            "concentrations on plans that include them) and current " +
            "weather (temperature, humidity, pressure, wind, icon) with " +
            "the city's coordinates.",
        docsUrl: "https://api-docs.iqair.com",
        notes: [
            "city, state, and country must match IQAir's own English " +
            "names exactly (e.g. USA, not United States); otherwise the " +
            "answer is a city_not_found error.",
        ],
    },
    endpoint: "/get_city_air_quality",
    request: { method: "GET", path: "/city" },
    input: { schema: { queryParams: zCityQuery } },
});
