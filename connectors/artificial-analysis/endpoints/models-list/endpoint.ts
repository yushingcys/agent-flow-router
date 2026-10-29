import { defineEndpoint } from "@shared/core";
import { zModelsListQuery } from "./schema/inputs.ts";

/** GET /language/models/free - works with any key tier. */
export default defineEndpoint({
    meta: {
        displayName: "List Language Models",
        summary: "Every benchmarked LLM with its intelligence indices, " +
            "speed, and prices.",
        description: "List every language model Artificial Analysis " +
            "benchmarks, 200 per page: id, name, slug, release date, " +
            "creator, the Intelligence Index and the six capability " +
            "indices, the cost to run the Intelligence Index (total and " +
            "per task), input and output price per million tokens, median " +
            "output tokens per second, and median time to first token.",
        docsUrl:
            "https://artificialanalysis.ai/data-api/docs/reference#getLanguageModelsFree",
    },
    endpoint: "/get_models_list",
    request: { method: "GET", path: "/language/models/free" },
    input: { schema: { queryParams: zModelsListQuery } },
});
