import { z } from "zod";
import { zAudioFile, zFileFormat } from "../../../schema/audio.ts";

const zEntities = z.union([z.string(), z.array(z.string())]);

/**
 * POST /v1/speech-to-text multipart fields. Not mirrored: the webhook
 * fields (an early return carries no transcript to bill or present),
 * `additional_formats` and `webhook_metadata` (objects, not form values),
 * and the deprecated `cloud_storage_url`.
 */
export const zSttBody = z.looseObject({
    model_id: z.enum(["scribe_v1", "scribe_v2"]).describe(
        "Transcription model; scribe_v2 is the latest.",
    ),
    file: zAudioFile.optional(),
    source_url: z.string().url().describe(
        "URL of an audio or video file to transcribe instead of `file` - " +
            "hosted files, YouTube, TikTok and other video pages.",
    ).optional(),
    language_code: z.string().describe(
        "ISO-639-1 or -3 language code; omitted, it is detected.",
    ).optional(),
    tag_audio_events: z.boolean().describe(
        "Tag events like (laughter) or (footsteps) (default true).",
    ).optional(),
    num_speakers: z.number().int().min(1).max(32).describe(
        "Maximum number of speakers, a hint for diarization (up to 32).",
    ).optional(),
    timestamps_granularity: z.enum(["none", "word", "character"]).describe(
        "Timestamp detail (default 'word').",
    ).optional(),
    diarize: z.boolean().describe(
        "Label which speaker is talking (default false).",
    ).optional(),
    diarization_threshold: z.number().min(0.1).max(0.4).describe(
        "Higher means fewer speakers split apart (with diarize and no " +
            "num_speakers).",
    ).optional(),
    detect_speaker_roles: z.boolean().describe(
        "Label speakers as agent or customer (requires diarize).",
    ).optional(),
    file_format: zFileFormat.optional(),
    temperature: z.number().min(0).max(2).describe(
        "Randomness of the transcript (0-2).",
    ).optional(),
    seed: z.number().int().min(0).max(2147483647).describe(
        "Best-effort deterministic sampling.",
    ).optional(),
    use_multi_channel: z.boolean().describe(
        "Transcribe each channel as its own speaker (up to 5 channels).",
    ).optional(),
    multichannel_output_style: z.enum(["separate", "combined"]).describe(
        "With use_multi_channel: one transcript per channel or merged.",
    ).optional(),
    no_verbatim: z.boolean().describe(
        "Drop filler words, false starts and non-speech sounds (scribe_v2).",
    ).optional(),
    entity_detection: zEntities.describe(
        "Detect entities: 'all', a category ('pii', 'phi', 'pci') or " +
            "specific entity types.",
    ).optional(),
    entity_redaction: zEntities.describe(
        "Redact entities from the text, same values as entity_detection.",
    ).optional(),
    entity_redaction_mode: z.enum([
        "redacted",
        "entity_type",
        "enumerated_entity_type",
    ]).describe("How redacted entities are written.").optional(),
    keyterms: z.array(z.string().max(50)).max(1000).describe(
        "Words or phrases to bias recognition toward (+$0.05 per hour).",
    ).optional(),
    transcript_edit: z.string().max(2000).describe(
        "Instruction applied to the final transcript, returned as " +
            "`edited_transcript` (+$0.07 per hour).",
    ).optional(),
});
