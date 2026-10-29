import { z } from "zod";
import { zDetails, zLanguage } from "../../../schema/common.ts";

/** Inputs of the two calls get_weather makes:
 *  `GET /currentconditions/v1/{locationKey}` and
 *  `GET /forecasts/v1/daily/5day/{locationKey}`
 *  (developer.accuweather.com/core-weather/location-key-currentconditions
 *  and /location-key-daily, read 2026-10-29). */
export const zGetWeatherPath = z.strictObject({
    locationKey: z.string().min(1).describe(
        "AccuWeather location `Key`, from accuweather#search_locations " +
            "or accuweather#list_cities, e.g. 349727 (New York).",
    ),
});

export const zGetWeatherQuery = z.strictObject({
    language: zLanguage.optional(),
    details: zDetails.optional(),
    metric: z.boolean().describe(
        "Forecast in metric units (vendor default false, imperial). " +
            "Current conditions always carry both.",
    ).optional(),
});
