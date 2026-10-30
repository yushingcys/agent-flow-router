import { z } from "zod";
import { defineEndpoint, UsageModelKind } from "@shared/core";
import { zTtsFields } from "../../schema/tts.ts";
import { voiceGateStart } from "../../schema/voice-gate.ts";

/**
 * Monid's Turbo Free promo listing. Same HeyGen call as /text-to-speech
 * (`POST /v3/models/audio/tts`) with `model` pinned to HeyGen's own free
 * `heygen-voice-1-turbo-free`, which HeyGen bills at $0 through
 * 2026-11-30. HeyGen never upgrades a free request to a paid model.
 */
export default defineEndpoint({
    meta: {
        displayName: "HeyGen Turbo Text to Speech (Free)",
        summary: "Free text-to-speech with HeyGen Voice 1 Turbo, limited time.",
        description: "LIMITED-TIME: HeyGen Voice 1 Turbo at no charge " +
            "through 2026-11-30. Speak up to 5,000 characters with a " +
            "public voice from /voices or an instant clone from " +
            "/voices/clone. Returns `data.audio_url` (44.1 kHz WAV), " +
            "`data.duration` and, with `with_timestamps`, per-character " +
            "timings. Capacity is shared by every Turbo Free user and not " +
            "guaranteed; use /text-to-speech with heygen-voice-1-turbo for " +
            "guaranteed capacity.",
        docsUrl: "https://developers.heygen.com/docs/voices/" +
            "heygen-voice-speech#turbo-free",
        categories: ["speech"],
        notes: [
            "A busy service answers 429 even within your request limit; " +
            "retry after Retry-After or with backoff.",
            "Professional voice clones are not supported.",
            "When HeyGen ends the offer the model stops answering; switch " +
            "to /text-to-speech.",
        ],
    },
    endpoint: "/promo/text-to-speech/turbo-free",
    request: { method: "POST", path: "/v3/models/audio/tts" },
    input: {
        schema: { body: z.object(zTtsFields).strict() },
        toRequest: ({ data, utils }) => ({
            ...data.input,
            body: utils.json.merge(data.input.body ?? {}, {
                model: "heygen-voice-1-turbo-free",
            }),
        }),
    },
    resources: { reads: [{ id: "heygen/voice" }] },
    usage: { model: { kind: UsageModelKind.FREE } },
    lifecycle: { start: voiceGateStart },
});
