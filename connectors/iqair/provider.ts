import { defineProvider, UsageModelKind } from "@shared/core";

/**
 * IQAir AirVisual API (api-docs.iqair.com) - real-time air quality and
 * weather for cities worldwide.
 *
 * Monid lists IQAir as a parse.bot scraper (snake_case tool names,
 * docUrl parse.bot/marketplace/iqair-com-api). IQAir has a real keyed
 * API, so the endpoints with an API equivalent keep Monid's id
 * (`endpoint:`) and call `https://api.airvisual.com/v2` instead. Auth is
 * the `key` QUERY parameter (no header form is documented), so
 * `deno task record` keeps it in the recorded URL: scrub it by hand.
 *
 * Rate card: AirVisual plans meter API calls (per-minute and monthly
 * call quotas per key, `call_limit_reached` past them), with no cost in
 * the response. One pool `default` = API calls, PER_CALL 1. Monid's
 * prices are the scraper's, not IQAir's.
 *
 * Not mapped (no API equivalent): get_world_air_quality (iqair.com's
 * world ranking pages) and get_map_data (iqair.com's map tiles).
 */
export default defineProvider({
    name: "iqair",
    meta: {
        displayName: "IQAir AirVisual",
        summary: "Real-time air quality (US and China AQI, pollutants) " +
            "and weather for cities worldwide.",
        description: "Read the current US and China AQI, main pollutant, " +
            "and weather for any supported city, and the live ranking of " +
            "major world cities by AQI, from IQAir's AirVisual network.",
        homepageUrl: "https://www.iqair.com",
        docsUrl: "https://api-docs.iqair.com",
        categories: ["weather"],
        notes: [
            'Errors come back as `{status: "fail", data: {message}}`; the ' +
            "message is a code such as city_not_found, incorrect_api_key, " +
            "call_limit_reached, or feature_not_available (the key's plan " +
            "lacks the endpoint).",
            "How much detail a response carries (per-pollutant " +
            "concentrations, units) depends on the key's plan.",
        ],
    },
    auth: {
        inject: ({ data }) => ({
            ...data.request,
            query: { ...data.request.query, key: [data.params.apiKey] },
        }),
    },
    request: { baseUrl: "https://api.airvisual.com/v2" },
    timeouts: { requestMs: 30_000, runMs: 60_000 },
    usage: {
        credits: { default: { label: "AirVisual API calls" } },
        model: {
            kind: UsageModelKind.PER_CALL,
            label: "API call",
            consumes: { credit: "default", amount: 1 },
        },
    },
    output: {
        fromError: ({ data, utils }) => {
            const message = utils.json.optionalGet(
                data.output,
                "$.data.message",
            );
            return {
                message: typeof message === "string" && message !== ""
                    ? message
                    : "IQAir API error",
                raw: data.output,
            };
        },
    },
});
