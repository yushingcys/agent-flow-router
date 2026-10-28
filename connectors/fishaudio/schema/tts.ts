import { z } from "zod";

/** TTS models a run may select. `s2.1-pro-free` (the free developer tier)
 *  is left out: it is free upstream, so a billed relay of it is not a
 *  product. */
export const TTS_MODELS = ["s2.1-pro", "s2-pro", "s1", "drama-3"] as const;
/** The vendor default, pinned at the binding: it is the pricing selector. */
export const DEFAULT_TTS_MODEL = "s2.1-pro";

/**
 * POST /v1/tts (and /v1/tts/stream/with-timestamp) JSON body, plus our
 * `model` (the vendor's `model` HEADER). Not mirrored: `references`
 * (MessagePack-only inline clips), `features` and `pronunciation_dictionary`.
 */
export const zTtsBody = z.looseObject({
    model: z.enum(TTS_MODELS).describe(
        "TTS model: s2.1-pro (default), s2-pro, s1 (retiring 2026-12-31) " +
            "at $15 per million UTF-8 bytes; drama-3 (most expressive, " +
            "multi-speaker) at $50.",
    ).optional(),
    text: z.string().min(1).describe(
        "Text to speak. For multi-speaker (S2 and drama-3), tag turns " +
            "'<|speaker:0|>Hi!<|speaker:1|>Hello!' and pass one reference_id " +
            "per speaker.",
    ),
    reference_id: z.union([z.string(), z.array(z.string()).min(1)]).describe(
        "Voice model id (from fishaudio#voices), or one id per speaker for " +
            "multi-speaker text.",
    ).nullable().optional(),
    temperature: z.number().min(0).max(1).describe(
        "Expressiveness; higher is more varied (default 0.7).",
    ).optional(),
    top_p: z.number().min(0).max(1).describe(
        "Nucleus sampling diversity (default 0.7).",
    ).optional(),
    prosody: z.looseObject({
        speed: z.number().min(0.5).max(2).describe(
            "Speaking rate multiplier (0.5-2.0, default 1).",
        ).optional(),
        volume: z.number().describe("Volume change in dB (default 0).")
            .optional(),
    }).describe("Speed and volume adjustments.").nullable().optional(),
    chunk_length: z.number().int().min(100).max(300).describe(
        "Text segment size for processing (default 300).",
    ).optional(),
    normalize: z.boolean().describe(
        "Spell out numbers, dates and symbols first (default true).",
    ).optional(),
    language: z.string().max(35).regex(/^[A-Za-z0-9_-]*$/).describe(
        "BCP-47 tag of the text, e.g. 'en' or 'zh-CN'; detected if omitted.",
    ).nullable().optional(),
    format: z.enum(["wav", "pcm", "mp3", "opus"]).describe(
        "Output format (default mp3).",
    ).optional(),
    sample_rate: z.number().int().describe(
        "Sample rate in Hz; default 44100 (48000 for opus).",
    ).nullable().optional(),
    mp3_bitrate: z.union([z.literal(64), z.literal(128), z.literal(192)])
        .describe("MP3 bitrate in kbps (default 128).").optional(),
    opus_bitrate: z.union([
        z.literal(-1000),
        z.literal(24000),
        z.literal(32000),
        z.literal(48000),
        z.literal(64000),
    ]).describe("Opus bitrate in bps; -1000 is automatic (default).")
        .optional(),
    latency: z.enum(["low", "normal", "balanced"]).describe(
        "Latency/quality trade-off (default 'normal', best quality).",
    ).optional(),
    max_new_tokens: z.number().int().describe(
        "Max audio tokens per text chunk (default 1024).",
    ).optional(),
    repetition_penalty: z.number().describe(
        "Above 1.0 reduces repeated audio patterns (default 1.2).",
    ).optional(),
    min_chunk_length: z.number().int().min(0).max(100).describe(
        "Minimum characters before a new chunk (default 50).",
    ).optional(),
    condition_on_previous_chunks: z.boolean().describe(
        "Use earlier audio as context for consistency (default true).",
    ).optional(),
    early_stop_threshold: z.number().min(0).max(1).describe(
        "Early stopping threshold for batching (default 1).",
    ).optional(),
});

export const zTtsBinding = zTtsBody.extend({
    model: zTtsBody.shape.model.unwrap().default(DEFAULT_TTS_MODEL),
});
