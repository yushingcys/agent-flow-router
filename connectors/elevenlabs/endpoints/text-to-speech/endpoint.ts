import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zAudioQuery } from "../../schema/audio.ts";
import {
    DEFAULT_TTS_MODEL,
    FLASH_MODELS,
    zTtsBody,
    zTtsPathParams,
} from "./schema/inputs.ts";

/**
 * Text to speech, through the vendor's `/with-timestamps` variant: the same
 * synthesis and price as the binary endpoint, but JSON - `audio_base64` plus
 * per-character `alignment`.
 *
 * MODEL IS THE RATE: Flash/Turbo bill $0.04 / 1K characters, every other
 * model $0.08. Two composite lines, routed by `model_id` (the minimax D5
 * shape); the unselected line is absent from evidence. ElevenLabs reports
 * no character count, so evidence is the submitted text length.
 */
export default defineEndpoint({
    meta: {
        displayName: "ElevenLabs Text to Speech",
        summary: "Convert text to lifelike speech with an ElevenLabs voice.",
        description: "Speak up to 40,000 characters (10,000 on " +
            "multilingual_v2, 5,000 on v3) in any ElevenLabs voice. Returns " +
            "`audio_base64` (MP3 by default, see `output_format`) and " +
            "`alignment`, the start and end time of every character. Tune " +
            "delivery with `voice_settings`, chain long scripts with " +
            "`previous_text`/`next_text`, and pick the model: eleven_v3 for " +
            "expressive audio tags like [whispers], multilingual_v2 for " +
            "stable long-form, Flash/Turbo for half the price. $0.08 per " +
            "1K characters, $0.04 on Flash/Turbo.",
        docsUrl: "https://elevenlabs.io/docs/api-reference/text-to-speech/" +
            "convert-with-timestamps",
        categories: ["speech"],
    },
    endpoint: "/text-to-speech",
    request: {
        method: "POST",
        path: "/v1/text-to-speech/{voice_id}/with-timestamps",
    },
    input: {
        schema: {
            pathParams: zTtsPathParams,
            queryParams: zAudioQuery,
            body: zTtsBody.extend({
                model_id: zTtsBody.shape.model_id.unwrap()
                    .default(DEFAULT_TTS_MODEL),
            }),
        },
    },
    usage: {
        model: {
            kind: UsageModelKind.COMPOSITE,
            components: {
                character: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.CHARACTER,
                    consumes: { credit: "default", amount: 0.00008 },
                    label: "characters",
                    description: "$0.08 per 1K characters (v3, multilingual)",
                },
                flash_character: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.CHARACTER,
                    consumes: { credit: "default", amount: 0.00004 },
                    label: "Flash/Turbo characters",
                    description: "$0.04 per 1K characters on Flash/Turbo",
                },
            },
        },
        estimate: ({ data }) => {
            const model = data.input.body.model_id;
            const flash = model === "eleven_flash_v2_5" ||
                model === "eleven_flash_v2" ||
                model === "eleven_turbo_v2_5" || model === "eleven_turbo_v2";
            const chars = data.input.body.text.length;
            return {
                counts: flash
                    ? { "flash_character": chars }
                    : { "character": chars },
            };
        },
        /** Same count at settle: ElevenLabs bills the submitted text. */
        evidence: ({ data }) => {
            const model = data.input.body.model_id;
            const flash = model === "eleven_flash_v2_5" ||
                model === "eleven_flash_v2" ||
                model === "eleven_turbo_v2_5" || model === "eleven_turbo_v2";
            const chars = data.input.body.text.length;
            return {
                counts: flash
                    ? { "flash_character": chars }
                    : { "character": chars },
            };
        },
    },
});

export { DEFAULT_TTS_MODEL, FLASH_MODELS };
