import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zAudioQuery } from "../../schema/audio.ts";
import { zDialogueBody } from "./schema/inputs.ts";

/**
 * Multi-speaker dialogue, through the `/with-timestamps` JSON variant
 * (`audio_base64`, `alignment`, `voice_segments`). Billed $0.08 per 1K
 * characters across every line - eleven_v3 is the only dialogue model.
 */
export default defineEndpoint({
    meta: {
        displayName: "ElevenLabs Text to Dialogue",
        summary: "Generate multi-speaker dialogue audio from text lines.",
        description: "Turn an ordered list of {text, voice_id} lines into " +
            "one natural conversation with eleven_v3 - speakers interrupt, " +
            "react and carry emotion, and audio tags like [laughs] or " +
            "[sarcastically] direct the delivery. Returns `audio_base64` " +
            "(MP3 by default), per-character `alignment`, and " +
            "`voice_segments` giving each line's start and end time. $0.08 " +
            "per 1K characters.",
        docsUrl: "https://elevenlabs.io/docs/api-reference/text-to-dialogue/" +
            "convert-with-timestamps",
        categories: ["speech"],
    },
    endpoint: "/v1/text-to-dialogue",
    request: { method: "POST", path: "/v1/text-to-dialogue/with-timestamps" },
    input: { schema: { queryParams: zAudioQuery, body: zDialogueBody } },
    usage: {
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.CHARACTER,
            consumes: { credit: "default", amount: 0.00008 },
            label: "characters",
            description: "$0.08 per 1K characters",
        },
        estimate: ({ data }) => ({
            counts: {
                CHARACTER: data.input.body.inputs.reduce(
                    (sum, line) => sum + line.text.length,
                    0,
                ),
            },
        }),
        /** ElevenLabs bills the submitted text; nothing to read back. */
        evidence: ({ data }) => ({
            counts: {
                CHARACTER: data.input.body.inputs.reduce(
                    (sum, line) => sum + line.text.length,
                    0,
                ),
            },
        }),
    },
});
