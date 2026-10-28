import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zVoicePathParams } from "../../schema/voice.ts";

/**
 * GET /model/{id} - one voice. Free. Identity is Monid's `/voices/get`: the
 * vendor path is shared with the delete below.
 */
export default defineEndpoint({
    meta: {
        displayName: "Fish Audio Get Voice",
        summary: "Get one voice's details and preview samples.",
        description: "Read one voice by id: title, description, tags, " +
            "languages, visibility, training `state` (a fresh clone is " +
            "usable once 'trained'), author, and preview `samples` with " +
            "their audio URLs and text. Free.",
        docsUrl: "https://docs.fish.audio/api-reference/endpoint/model/" +
            "get-model",
        categories: ["speech"],
    },
    endpoint: "/voices/get",
    request: { method: "GET", path: "/model/{id}" },
    input: { schema: { pathParams: zVoicePathParams } },
    usage: { model: { kind: UsageModelKind.FREE } },
});
