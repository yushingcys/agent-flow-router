import { z } from "zod";
import { zBinaryPart } from "@shared/core";

/**
 * Shared ElevenLabs request fields (api.elevenlabs.io/openapi.json, read
 * 2026-10-27). Mirrors carry optionality and vendor bounds only (D25).
 */

/** `output_format` query values: `codec_samplerate[_bitrate]`. Higher
 *  sample rates and bitrates need a paid tier (vendor note). */
export const zOutputFormat = z.enum([
    "mp3_22050_32",
    "mp3_24000_48",
    "mp3_44100_32",
    "mp3_44100_64",
    "mp3_44100_96",
    "mp3_44100_128",
    "mp3_44100_192",
    "pcm_8000",
    "pcm_16000",
    "pcm_22050",
    "pcm_24000",
    "pcm_32000",
    "pcm_44100",
    "pcm_48000",
    "ulaw_8000",
    "alaw_8000",
    "opus_48000_32",
    "opus_48000_64",
    "opus_48000_96",
    "opus_48000_128",
    "opus_48000_192",
]).describe(
    "Output audio format, codec_samplerate_bitrate (vendor default " +
        "mp3_44100_128). 192 kbps MP3 and 44.1 kHz+ PCM need a Creator or " +
        "Pro ElevenLabs tier.",
);

/** The query params every audio-producing endpoint takes. */
export const zAudioQuery = z.looseObject({
    output_format: zOutputFormat.optional(),
    enable_logging: z.boolean().describe(
        "false enables zero-retention mode (history and stitching " +
            "unavailable). Enterprise only.",
    ).optional(),
});

export const zVoiceSettings = z.looseObject({
    stability: z.number().min(0).max(1).describe(
        "Lower is more emotional range, higher more monotone (default 0.5).",
    ).nullable().optional(),
    similarity_boost: z.number().min(0).max(1).describe(
        "How closely to adhere to the original voice (default 0.75).",
    ).nullable().optional(),
    style: z.number().min(0).max(1).describe(
        "Style exaggeration of the original speaker (default 0).",
    ).nullable().optional(),
    use_speaker_boost: z.boolean().describe(
        "Boost similarity to the original speaker (default true).",
    ).nullable().optional(),
    speed: z.number().describe(
        "Speech speed; 1.0 is normal, below slows, above speeds up.",
    ).nullable().optional(),
});

export const zPronunciationLocators = z.array(z.looseObject({
    pronunciation_dictionary_id: z.string(),
    version_id: z.string().nullable().optional(),
})).max(3).describe(
    "Up to 3 pronunciation dictionaries, applied in order.",
);

/** An uploaded audio file: base64 bytes in the JSON body. */
export const zAudioFile = zBinaryPart.describe(
    "The audio file as {base64, contentType?, filename?} - the shape every " +
        "audio output of this catalog returns, so a generated clip can be " +
        "passed straight back in.",
);

export const zFileFormat = z.enum(["pcm_s16le_16", "other"]).describe(
    "'pcm_s16le_16' (16-bit PCM, 16 kHz, mono, little-endian) lowers " +
        "latency; 'other' (default) for every encoded format.",
);
