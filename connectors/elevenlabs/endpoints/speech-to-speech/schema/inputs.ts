import { z } from "zod";
import { zAudioFile, zFileFormat } from "../../../schema/audio.ts";

export const zStsPathParams = z.object({
    voice_id: z.string().min(1).describe(
        "The target voice. List voices with elevenlabs#voices.",
    ),
});

/** POST /v1/speech-to-speech/{voice_id} multipart fields. */
export const zStsBody = z.looseObject({
    audio: zAudioFile,
    model_id: z.string().describe(
        "Voice-changer model (vendor default 'eleven_english_sts_v2'; " +
            "'eleven_multilingual_sts_v2' for other languages).",
    ).optional(),
    voice_settings: z.string().describe(
        "Voice settings as a JSON string, e.g. " +
            '\'{"stability":0.5,"similarity_boost":0.75}\'.',
    ).optional(),
    seed: z.number().int().min(0).max(4294967295).describe(
        "Best-effort deterministic sampling.",
    ).optional(),
    remove_background_noise: z.boolean().describe(
        "Isolate the voice from background noise first.",
    ).optional(),
    file_format: zFileFormat.optional(),
});
