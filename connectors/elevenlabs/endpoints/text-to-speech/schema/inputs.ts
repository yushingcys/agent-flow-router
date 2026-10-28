import { z } from "zod";
import {
    zPronunciationLocators,
    zVoiceSettings,
} from "../../../schema/audio.ts";

/** Models billed at the Flash/Turbo rate ($0.04 / 1K characters). */
export const FLASH_MODELS = [
    "eleven_flash_v2_5",
    "eleven_flash_v2",
    "eleven_turbo_v2_5",
    "eleven_turbo_v2",
] as const;

/** The vendor's default model, pinned at the binding: it is the pricing
 *  selector, so a body omitting it must hold and settle one rate. */
export const DEFAULT_TTS_MODEL = "eleven_multilingual_v2";

export const zTtsPathParams = z.object({
    voice_id: z.string().min(1).describe(
        "Voice to speak with. List voices with elevenlabs#voices " +
            "(e.g. 'JBFqnCBsd6RMkjVDRZzb').",
    ),
});

/** POST /v1/text-to-speech/{voice_id}/with-timestamps body. */
export const zTtsBody = z.looseObject({
    text: z.string().min(1).describe("The text to speak."),
    model_id: z.string().describe(
        "Model: eleven_v3 (most expressive, audio tags), " +
            "eleven_multilingual_v2 (default), eleven_flash_v2_5 / " +
            "eleven_turbo_v2_5 (half price, lowest latency).",
    ).optional(),
    language_code: z.string().describe(
        "ISO 639-1 code to enforce a language (models that support it).",
    ).nullable().optional(),
    voice_settings: zVoiceSettings.describe(
        "Overrides the voice's stored settings for this request.",
    ).nullable().optional(),
    pronunciation_dictionary_locators: zPronunciationLocators.optional(),
    seed: z.number().int().min(0).max(4294967295).describe(
        "Best-effort deterministic sampling.",
    ).nullable().optional(),
    previous_text: z.string().describe(
        "Text before this request, for continuity across splits.",
    ).nullable().optional(),
    next_text: z.string().describe(
        "Text after this request, for continuity across splits.",
    ).nullable().optional(),
    previous_request_ids: z.array(z.string()).max(3).describe(
        "request_ids of up to 3 earlier generations to continue from.",
    ).optional(),
    next_request_ids: z.array(z.string()).max(3).describe(
        "request_ids of up to 3 later generations to lead into.",
    ).optional(),
    apply_text_normalization: z.enum(["auto", "on", "off"]).describe(
        "Spell out numbers and the like ('auto' default).",
    ).optional(),
    apply_language_text_normalization: z.boolean().describe(
        "Language-specific normalization (Japanese only; adds latency).",
    ).optional(),
});
