import { defineEndpoint } from "@shared/core";
import { zQueryQuery } from "./schema/inputs.ts";

/** GET /query - one natural-language Census question. */
export default defineEndpoint({
    meta: {
        displayName: "Ask a Census Question",
        summary: "Answer a plain-English US Census question with a " +
            "summary and the raw ACS records.",
        description: "Query live US Census Bureau data (American " +
            "Community Survey 1-year and 5-year) in plain English for " +
            "states, counties, cities and towns, metro areas, and ZIP " +
            "codes. Resolves place names to FIPS codes and picks the " +
            "tables itself; returns `success`, a narrative `summary`, " +
            "and the `raw_data` records used. Handles multi-location " +
            "comparisons, rankings, and trends across years in one call.",
        notes: [
            "Unsure what data exists for a topic? Search the variable " +
            "catalog first with censusdata#explore-variables (free).",
            "A question the agent cannot answer can still return 200 " +
            "with `success: false` and `error_details`.",
            "429 means the key's daily query allowance is used up; it " +
            "resets at midnight UTC.",
        ],
    },
    request: { method: "GET", path: "/query" },
    input: { schema: { queryParams: zQueryQuery } },
});
