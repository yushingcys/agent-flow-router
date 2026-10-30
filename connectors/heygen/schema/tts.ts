import { z } from "zod";

/**
 * `POST /v3/models/audio/tts` request fields shared by /text-to-speech and
 * the Turbo Free promo - the faithful vendor mirror minus `model`, which
 * each endpoint states itself (docs/voices/heygen-voice-speech, read
 * 2026-10-29).
 */
export const zTtsFields = {
    voice_id: z.string().min(1).describe(
        "An ACTIVE public voice from /voices or a voice you cloned with " +
            "/voices/clone.",
    ),
    text: z.string().min(1).max(5000).describe(
        "Plain prose to speak, 1-5,000 characters. Professional voices " +
            'also take <break time="0.5s"/> pauses; no other SSML.',
    ),
    language: z.string().describe(
        "Language code of `text`, such as `en`. Detected from the text " +
            "when omitted; a wrong value gives that language's accent.",
    ).optional(),
    expressiveness_boost: z.number().min(0).max(1).describe(
        "Instant and public voices only, 0.0-1.0. HeyGen defaults to 1.0; " +
            "0.5 is closest to the original speaker.",
    ).optional(),
    seed: z.number().int().min(0).max(4294967295).describe(
        "Professional voices only (ignored otherwise): best-effort " +
            "deterministic seed.",
    ).optional(),
    speed: z.number().min(0.75).max(1.25).describe(
        "Professional voices only (ignored otherwise): speed multiplier.",
    ).optional(),
    pitch_shift: z.number().min(-4).max(4).describe(
        "Professional voices only (ignored otherwise): semitones.",
    ).optional(),
    pitch_variance: z.number().min(0.5).max(2).describe(
        "Professional voices only (ignored otherwise): pitch variation.",
    ).optional(),
    with_timestamps: z.boolean().describe(
        "Add `original_characters` (per-character start and end times) " +
            "to the response, for captions. No price impact.",
    ).optional(),
};
