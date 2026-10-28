import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zLocationsQuery } from "./schema/inputs.ts";

/** GET /locations.json - SerpApi's location directory. Free: no search
 *  credit is drawn. */
export default defineEndpoint({
    meta: {
        displayName: "Resolve Search Location",
        summary: "Free: turn a place name into the exact location string " +
            "search engines accept.",
        description: "Look up SerpApi's location directory by name and " +
            "get matching locations, largest reach first, each with its " +
            "`canonical_name` (pass it as `location` to any engine that " +
            "takes one), id, Google id, country code, target type, and " +
            "GPS coordinates. Free.",
        docsUrl: "https://serpapi.com/locations-api",
        categories: ["seo"],
    },
    endpoint: "/locations",
    request: { method: "GET", path: "/locations.json" },
    input: { schema: { queryParams: zLocationsQuery } },
    usage: { model: { kind: UsageModelKind.FREE } },
});
