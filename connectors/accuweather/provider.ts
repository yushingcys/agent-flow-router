import { defineProvider, presets, UsageModelKind } from "@shared/core";

/**
 * AccuWeather Core Weather API (developer.accuweather.com) - location
 * search, current conditions, and daily forecasts.
 *
 * Monid lists AccuWeather as a parse.bot scraper (snake_case tool names,
 * docUrl parse.bot/marketplace/accuweather-com-api). AccuWeather has a
 * real keyed API, so each endpoint keeps Monid's id (`endpoint:`) and
 * calls `https://dataservice.accuweather.com` instead. Auth is
 * `Authorization: Bearer <key>` (developer.accuweather.com/documentation/
 * authentication, read 2026-10-29); the legacy `apikey` query parameter
 * is not used.
 *
 * Rate card: AccuWeather plans meter API calls (a daily or monthly call
 * quota per key), with no per-call cost in the response. One pool
 * `default` = API calls, PER_CALL 1; get_weather makes two calls and
 * draws 2. Monid's prices are the scraper's, not AccuWeather's.
 */
export default defineProvider({
    name: "accuweather",
    meta: {
        displayName: "AccuWeather",
        summary: "Location search, current conditions, and daily forecasts " +
            "for any place worldwide.",
        description: "Find AccuWeather location keys for cities, postal " +
            "codes, and points of interest, list the world's top cities, " +
            "and read current conditions together with a 5-day daily " +
            "forecast for a location key.",
        homepageUrl: "https://www.accuweather.com",
        docsUrl: "https://developer.accuweather.com/core-weather",
        categories: ["weather"],
        notes: [
            "Weather reads take an AccuWeather location `Key`; get one " +
            "from accuweather#search_locations or accuweather#list_cities.",
            "A 403 means the key's plan does not include the endpoint or " +
            "its call quota is used up.",
        ],
    },
    auth: { inject: presets.auth.bearer() },
    request: { baseUrl: "https://dataservice.accuweather.com" },
    timeouts: { requestMs: 30_000, runMs: 60_000 },
    usage: {
        credits: { default: { label: "AccuWeather API calls" } },
        model: {
            kind: UsageModelKind.PER_CALL,
            label: "API call",
            consumes: { credit: "default", amount: 1 },
        },
    },
    output: {
        /** Error body: RFC 7807 problem JSON with AccuWeather's own
         *  `Code` / `Message` (e.g. 401 "API authorization failed"). */
        fromError: ({ data, utils }) => {
            const message = utils.json.optionalGet(data.output, "$.Message");
            const code = utils.json.optionalGet(data.output, "$.Code");
            return {
                message: typeof message === "string" && message !== ""
                    ? message
                    : "AccuWeather API error",
                ...(typeof code === "string" ? { code } : {}),
                raw: data.output,
            };
        },
    },
});
