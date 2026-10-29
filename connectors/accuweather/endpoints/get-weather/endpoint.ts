import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zGetWeatherPath, zGetWeatherQuery } from "./schema/inputs.ts";

/**
 * Current conditions plus a 5-day daily forecast for one location key.
 *
 * AccuWeather serves these as two operations, so `lifecycle.start` makes
 * both calls and returns `{current, forecast}` in one run. The input is a
 * location key, not a place name: resolving a name is its own billed
 * call (accuweather#search_locations), and the caller usually already
 * has the key. `metric` applies to the forecast only; the current
 * conditions endpoint returns both unit systems.
 */
export default defineEndpoint({
    meta: {
        displayName: "Get Current Weather and Forecast",
        summary: "Current conditions and a 5-day daily forecast for an " +
            "AccuWeather location key.",
        description: "Read the current weather (conditions text, " +
            "temperature, RealFeel, humidity, wind, UV, visibility, " +
            "pressure, and more with details) and the 5-day daily " +
            "forecast (headline, daily highs and lows, day and night " +
            "conditions, precipitation, sun and moon, air quality and " +
            "pollen) for one AccuWeather location key, in one call.",
        docsUrl: "https://developer.accuweather.com/core-weather/" +
            "location-key-currentconditions",
        notes: [
            "Makes two AccuWeather API calls (current conditions, then " +
            "the 5-day forecast) and draws two from the call quota. If " +
            "either fails, the run returns that error and bills nothing.",
        ],
    },
    endpoint: "/get_weather",
    request: { method: "GET", path: "/currentconditions/v1/{locationKey}" },
    input: {
        schema: { pathParams: zGetWeatherPath, queryParams: zGetWeatherQuery },
    },
    lifecycle: {
        start: async ({ data, utils }) => {
            const query = Object.entries(data.input.queryParams ?? {}).map((
                e,
            ) => [e[0], String(e[1])]);
            const current = await utils.http({
                method: "GET",
                url: data.request.url,
                queryParams: Object.fromEntries(
                    query.filter((e) => e[0] !== "metric"),
                ),
            });
            if (current.status < 200 || current.status >= 300) {
                return {
                    kind: "COMPLETED",
                    httpStatus: current.status,
                    output: current.body,
                };
            }
            const forecast = await utils.http({
                method: "GET",
                path: "/forecasts/v1/daily/5day/" +
                    encodeURIComponent(
                        data.input.pathParams?.locationKey ?? "",
                    ),
                queryParams: Object.fromEntries(query),
            });
            if (forecast.status < 200 || forecast.status >= 300) {
                return {
                    kind: "COMPLETED",
                    httpStatus: forecast.status,
                    output: forecast.body,
                };
            }
            return {
                kind: "COMPLETED",
                httpStatus: 200,
                output: {
                    current: Array.isArray(current.body)
                        ? current.body[0] ?? null
                        : current.body,
                    forecast: forecast.body,
                },
            };
        },
    },
    usage: {
        model: {
            kind: UsageModelKind.PER_CALL,
            label: "current conditions + 5-day forecast",
            consumes: { credit: "default", amount: 2 },
        },
    },
});
