import { z } from "zod";

/** POST /v1/sound-generation body. */
export const zSoundBody = z.looseObject({
    text: z.string().min(1).describe(
        "What the sound is, e.g. 'heavy wooden door creaks open, then " +
            "slams shut'.",
    ),
    duration_seconds: z.number().min(0.5).max(30).describe(
        "Length in seconds (0.5-30). Omitted, the model picks the length.",
    ).nullable().optional(),
    loop: z.boolean().describe(
        "Make the effect loop seamlessly (eleven_text_to_sound_v2 only).",
    ).optional(),
    prompt_influence: z.number().min(0).max(1).describe(
        "Higher follows the prompt more literally, less variation " +
            "(default 0.3).",
    ).nullable().optional(),
    model_id: z.string().describe(
        "Sound model (vendor default 'eleven_text_to_sound_v2').",
    ).optional(),
});
