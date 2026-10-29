import { defineEndpoint } from "@shared/core";
import { zProvidersQuery } from "./schema/inputs.ts";

/** GET /language/providers - Commercial keys only. */
export default defineEndpoint({
    meta: {
        displayName: "List LLM API Providers",
        summary: "Every LLM API provider with the models it serves, " +
            "prices, and median speed.",
        description: "List every language model API provider Artificial " +
            "Analysis measures, with the models each one serves, their " +
            "prices, and median performance (output speed, time to first " +
            "token) - the data behind the provider leaderboard.",
        docsUrl:
            "https://artificialanalysis.ai/data-api/docs/reference#getLanguageProviders",
        notes: [
            "Needs a Commercial key: Free and Pro keys answer 403.",
        ],
    },
    endpoint: "/get_llm_providers_leaderboard",
    request: { method: "GET", path: "/language/providers" },
    input: { schema: { queryParams: zProvidersQuery } },
});
