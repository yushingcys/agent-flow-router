import { defineEndpoint } from "@shared/core";
import { zBraveLlmContextQuery } from "./schema/inputs.ts";

/** GET /res/v1/llm/context — extracted passages for grounding a model. */
export default defineEndpoint({
    meta: {
        displayName: "Brave LLM Context",
        summary: "Get ranked, extracted page passages to ground an LLM.",
        description: "Search the web and return grounding context " +
            "instead of a results page: for each selected URL, its title " +
            "and the text chunks (prose, tables, code) most relevant to " +
            "the query, plus a `sources` map with hostname and page age. " +
            "Size the output with a token budget (1024-32768), cap URLs " +
            "and snippets, and choose how strict the relevance threshold " +
            "is. The best Brave endpoint for agents answering a question.",
        docsUrl:
            "https://api-dashboard.search.brave.com/api-reference/ai/llm_context/get",
        categories: ["web-search"],
        notes: [
            "Same price as a web search regardless of the token budget.",
        ],
    },
    request: { method: "GET", path: "/res/v1/llm/context" },
    input: { schema: { queryParams: zBraveLlmContextQuery } },
});
