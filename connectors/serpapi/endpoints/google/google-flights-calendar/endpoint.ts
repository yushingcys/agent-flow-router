import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zGoogleFlightsCalendarQuery } from "./schema/inputs.ts";

/** GET /search?engine=google_flights_calendar */
export default defineEndpoint({
    meta: {
        displayName: "Search Airfare Calendar",
        summary: "Find the cheapest dates on a route across a date range.",
        description:
            "Price each date in a range for one route, so an agent can answer which day in a month is cheapest. Unofficial results via SerpApi's `google_flights_calendar` engine, not an official Google Flights API. Requires departure_id and arrival_id.",
        docsUrl: "https://serpapi.com/google-flights-calendar-api",
        categories: ["flights"],
        notes: [
            'type, travel_class, and stops are strings such as "1", not integers. A number is rejected before the request is sent.',
            'round_trip_days and fixed_outbound_date apply only when type is "1", and they cannot be combined. exclude_airlines and include_airlines cannot be combined.',
        ],
    },
    endpoint: "/google/flights-calendar",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zGoogleFlightsCalendarQuery.extend({
                engine: zEngine("google_flights_calendar"),
            }),
        },
    },
});
