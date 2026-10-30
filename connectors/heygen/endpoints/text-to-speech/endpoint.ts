import { z } from "zod";
import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zTtsFields } from "../../schema/tts.ts";
import { voiceGateStart } from "../../schema/voice-gate.ts";

/**
 * `POST /v3/models/audio/tts` - one completed 44.1 kHz WAV, behind the
 * shared voice gate. MODEL IS THE RATE: heygen-voice-1 $0.03 / 1K
 * characters, heygen-voice-1-turbo $0.004. The free Turbo model is its own
 * endpoint (/promo/text-to-speech/turbo-free). HeyGen reports no character
 * count, so evidence is the submitted text length.
 */
const zBody = z.object({
    model: z.enum(["heygen-voice-1", "heygen-voice-1-turbo"]).describe(
        "heygen-voice-1: best quality, public/instant/professional voices. " +
            "heygen-voice-1-turbo: several times faster and about 7x " +
            "cheaper, public and instant voices. HeyGen defaults to " +
            "heygen-voice-1.",
    ).optional(),
    ...zTtsFields,
}).strict();

export default defineEndpoint({
    meta: {
        displayName: "HeyGen Text to Speech",
        summary: "Lifelike speech from text with HeyGen Voice 1.",
        description: "Generate speech from up to 5,000 characters of text " +
            "with HeyGen Voice 1, in any public voice from /voices or a " +
            "voice you cloned with /voices/clone; the language is detected " +
            "from the text or set explicitly. heygen-voice-1 gives the " +
            "best quality ($0.03 / 1K characters); heygen-voice-1-turbo is " +
            "several times faster at $0.004 / 1K. Returns " +
            "`data.audio_url` (44.1 kHz mono WAV), `data.duration` in " +
            "seconds and, with `with_timestamps`, per-character timings.",
        docsUrl:
            "https://developers.heygen.com/docs/voices/heygen-voice-speech",
        categories: ["speech"],
        notes: [
            "A clone that is still PENDING answers 409 voice_not_ready - " +
            "wait for ACTIVE on /voices/get.",
            "Turbo does not speak professional voices (400).",
        ],
    },
    endpoint: "/text-to-speech",
    request: { method: "POST", path: "/v3/models/audio/tts" },
    input: {
        schema: {
            body: zBody.extend({
                model: zBody.shape.model.unwrap().default("heygen-voice-1"),
            }),
        },
    },
    resources: { reads: [{ id: "heygen/voice" }] },
    usage: {
        model: {
            kind: UsageModelKind.COMPOSITE,
            components: {
                character: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.CHARACTER,
                    consumes: { credit: "default", amount: 0.00003 },
                    label: "HeyGen Voice 1 characters",
                    description: "$0.03 per 1K characters",
                },
                turbo_character: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.CHARACTER,
                    consumes: { credit: "default", amount: 0.000004 },
                    label: "HeyGen Voice 1 Turbo characters",
                    description: "$0.004 per 1K characters",
                },
            },
        },
        estimate: ({ data }) => {
            const chars = data.input.body.text.length;
            return {
                counts: data.input.body.model === "heygen-voice-1-turbo"
                    ? { turbo_character: chars }
                    : { character: chars },
            };
        },
        evidence: ({ data }) => {
            const chars = data.input.body.text.length;
            return {
                counts: data.input.body.model === "heygen-voice-1-turbo"
                    ? { turbo_character: chars }
                    : { character: chars },
            };
        },
    },
    lifecycle: { start: voiceGateStart },
});
