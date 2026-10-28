import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zVoiceDesignBody } from "./schema/inputs.ts";

/**
 * POST /v1/voice-design - JSON both ways; the model header has one legal
 * value, so it is a static request header. $0.01 per successful request,
 * whatever `n`.
 */
export default defineEndpoint({
    meta: {
        displayName: "Fish Audio Design Voice from Prompt",
        summary: "Generate 1-4 candidate voices from a text description.",
        description: "Describe a voice in words - age, gender, accent, " +
            "timbre, mood, use - and get 1-4 candidates back, each with a " +
            "base64 audio preview (`audio_base64`, `sample_rate`, " +
            "`duration_ms`). Keep one by passing its preview to " +
            "fishaudio#voices/clone with the candidate's signature in " +
            "`voice_design_signatures`. $0.01 per request.",
        docsUrl: "https://docs.fish.audio/api-reference/endpoint/openapi-v1/" +
            "voice-design",
        categories: ["speech"],
    },
    endpoint: "/voice-design",
    request: {
        method: "POST",
        path: "/v1/voice-design",
        headers: { model: "voice-design-1" },
    },
    input: { schema: { body: zVoiceDesignBody } },
    usage: {
        model: {
            kind: UsageModelKind.PER_CALL,
            consumes: { credit: "default", amount: 0.01 },
            label: "request",
            description: "$0.01 per successful request",
        },
    },
});
