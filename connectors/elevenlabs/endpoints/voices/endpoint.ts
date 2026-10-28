import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zVoicesQuery } from "./schema/inputs.ts";

/** GET /v2/voices - the voices this account can speak with. Free. */
export default defineEndpoint({
    meta: {
        displayName: "ElevenLabs List Voices",
        summary: "List the ElevenLabs voices available to this account.",
        description: "Page through the voices this account can use - " +
            "ElevenLabs' premade voices plus any saved, cloned or designed " +
            "ones - with each voice's `voice_id`, name, category, labels " +
            "(gender, age, accent, use case), description and a " +
            "`preview_url` sample. Filter by search text, category, type or " +
            "labels; follow `next_page_token` while `has_more`. Free.",
        docsUrl: "https://elevenlabs.io/docs/api-reference/voices/search",
        categories: ["speech"],
    },
    endpoint: "/voices",
    request: { method: "GET", path: "/v2/voices" },
    input: { schema: { queryParams: zVoicesQuery } },
    usage: { model: { kind: UsageModelKind.FREE } },
});
