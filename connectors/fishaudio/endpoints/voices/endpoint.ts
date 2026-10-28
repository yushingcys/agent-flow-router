import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zVoicesQuery } from "./schema/inputs.ts";

/** GET /model - search the voice library. Free. */
export default defineEndpoint({
    meta: {
        displayName: "Fish Audio Search Voice Library",
        summary: "Search the public library of 2M+ text-to-speech voices.",
        description: "Search Fish Audio's voice library - 2M+ community " +
            "and licensed voices - by title, tag or language, sorted by " +
            "popularity, usage or recency; `self: true` lists this " +
            "account's own clones. Each item carries the voice `_id` (the " +
            "`reference_id` for text to speech), title, description, tags, " +
            "languages and preview `samples`. Free.",
        docsUrl: "https://docs.fish.audio/api-reference/endpoint/model/" +
            "list-models",
        categories: ["speech"],
    },
    endpoint: "/voices",
    request: { method: "GET", path: "/model" },
    input: { schema: { queryParams: zVoicesQuery } },
    usage: { model: { kind: UsageModelKind.FREE } },
});
