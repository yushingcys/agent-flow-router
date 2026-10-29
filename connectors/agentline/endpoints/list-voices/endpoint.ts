import { defineEndpoint } from "@shared/core";

/** `GET /v1/voices` - the voice presets a persona can speak with. */
export default defineEndpoint({
    meta: {
        displayName: "List Voices",
        summary: "List the preset voices available for a phone persona.",
        description: "List the text-to-speech voice presets a phone persona " +
            "can speak with - each preset's preset_name (e.g. female-1, " +
            "male-2), voice_id, name and a description of its tone. Pass a " +
            "preset_name or voice_id as voice_id on /provision-numbers, " +
            "/update-numbers or /place-calls.",
        docsUrl: "https://docs.agentline.cloud/guides/agents",
        categories: ["agentic-phone"],
    },
    endpoint: "/list-voices",
    request: { method: "GET", path: "/v1/voices" },
});
