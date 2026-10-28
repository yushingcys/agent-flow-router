import { z } from "zod";
import { zBinaryPart } from "@shared/core";

const zStrings = z.union([z.string(), z.array(z.string())]);
const zAudio = zBinaryPart.describe(
    "A recording as {base64, contentType?, filename?}: WAV, MP3 or FLAC, " +
        "ideally 10-30 s of clear speech.",
);

/** POST /model multipart fields (fast-train TTS voices). */
export const zCloneBody = z.looseObject({
    type: z.literal("tts").describe("Model type; 'tts' is the only one."),
    train_mode: z.literal("fast").describe(
        "'fast': the voice is usable as soon as it is created.",
    ),
    title: z.string().min(1).describe("The voice's name."),
    voices: z.union([zAudio, z.array(zAudio).min(1).max(20)]).describe(
        "1-20 recordings of the voice.",
    ),
    texts: zStrings.describe(
        "Transcripts of the recordings, in order; omitted, they are " +
            "transcribed automatically.",
    ).optional(),
    description: z.string().describe("Voice description.").optional(),
    visibility: z.enum(["public", "unlist", "private"]).describe(
        "'private' (default) or 'unlist' (anyone with the id); public " +
            "requests are downgraded to private.",
    ).optional(),
    tags: zStrings.describe("Tags.").optional(),
    enhance_audio_quality: z.boolean().describe(
        "Clean up the recordings first (default true).",
    ).optional(),
    generate_sample: z.boolean().describe(
        "Generate a default preview sample (default false).",
    ).optional(),
    voice_design_signatures: zStrings.describe(
        "Signatures from fishaudio#voice-design candidates, one per " +
            "recording in order, to save designed voices.",
    ).optional(),
});
