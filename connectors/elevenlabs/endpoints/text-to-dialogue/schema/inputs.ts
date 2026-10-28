import { z } from "zod";
import { zPronunciationLocators } from "../../../schema/audio.ts";

/** POST /v1/text-to-dialogue/with-timestamps body. */
export const zDialogueBody = z.looseObject({
    inputs: z.array(z.looseObject({
        text: z.string().min(1).describe("What this speaker says."),
        voice_id: z.string().min(1).describe("The voice for this line."),
    })).min(1).describe(
        "The dialogue in order: one {text, voice_id} per line. Lines may " +
            "carry eleven_v3 audio tags such as [laughs] or [whispers].",
    ),
    model_id: z.string().describe(
        "Dialogue model (vendor default 'eleven_v3').",
    ).optional(),
    language_code: z.string().describe(
        "ISO 639-1 code to enforce a language.",
    ).nullable().optional(),
    settings: z.looseObject({
        stability: z.number().min(0).max(1).describe(
            "Lower is more emotional range (default 0.5).",
        ).nullable().optional(),
    }).describe("Dialogue generation settings.").nullable().optional(),
    pronunciation_dictionary_locators: zPronunciationLocators.nullable()
        .optional(),
    seed: z.number().int().min(0).max(4294967295).describe(
        "Best-effort deterministic sampling.",
    ).nullable().optional(),
    apply_text_normalization: z.enum(["auto", "on", "off"]).describe(
        "Spell out numbers and the like ('auto' default).",
    ).optional(),
});
