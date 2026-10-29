import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zExploreVariablesQuery } from "./schema/inputs.ts";

/** GET /explore-variables - free variable-catalog search. */
export default defineEndpoint({
    meta: {
        displayName: "Explore Census Variables",
        summary: "Free: find which US Census variables exist for a topic.",
        description: "Search the US Census variable catalog (28,000+ " +
            "Data Profile and Subject Table indicators) by topic keyword " +
            "and get each match's id, name, description, and a " +
            "ready-to-use `suggested_query` for censusdata#query. " +
            "Discovery only: it returns no statistics. Free.",
    },
    request: { method: "GET", path: "/explore-variables" },
    input: { schema: { queryParams: zExploreVariablesQuery } },
    usage: { model: { kind: UsageModelKind.FREE } },
});
