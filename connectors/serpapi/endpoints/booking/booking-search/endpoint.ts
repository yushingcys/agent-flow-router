import { defineEndpoint } from "@shared/core";
import { zEngine } from "../../../schema/common.ts";
import { zBookingSearchQuery } from "./schema/inputs.ts";

/** GET /search?engine=booking */
export default defineEndpoint({
    meta: {
        displayName: "Search Booking.com",
        summary: "Search Booking.com stays with prices for given dates.",
        description:
            "Search Booking.com for hotels and other stays, with prices, review scores, and deals. Unofficial results via SerpApi's `booking` engine, not an official Booking.com API. Requires q. Pass check_in_date and check_out_date together to get prices.",
        docsUrl: "https://serpapi.com/booking-api",
        categories: ["hotels"],
        notes: [
            "check_in_date and check_out_date must be sent together. flex_window and a price bound also need those dates; a price bound needs currency.",
            'flex_window and rating are strings such as "1" and "9", not integers.',
        ],
    },
    endpoint: "/booking/search",
    request: { method: "GET", path: "/search" },
    input: {
        schema: {
            queryParams: zBookingSearchQuery.extend({
                engine: zEngine("booking"),
            }),
        },
    },
});
