import { z } from "zod";
import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zUrlMedia } from "../../schema/media.ts";
import { voiceGateStart } from "../../schema/voice-gate.ts";

/**
 * `POST /v3/models/audio/sts` - re-speak a recording in another voice,
 * behind the shared voice gate. Synchronous: HeyGen holds the request up
 * to 150 s, so requestMs is raised past it. $0.12 per minute of audio,
 * metered on the response `duration` (it equals the source's).
 */
export default defineEndpoint({
    meta: {
        displayName: "HeyGen Speech to Speech",
        summary:
            "Re-speak a recording in another voice, same words and timing.",
        description: "Re-voice a recording of up to 5 minutes: HeyGen " +
            "Voice keeps every word, pause and the pacing of the source " +
            "and replaces the speaker's voice with one you cloned with " +
            "/voices/clone. Optionally removes background noise first. " +
            "Returns `data.audio_url` (WAV) and `data.duration` (equal to " +
            "the source). Suited for dubbing your own takes into a brand " +
            "voice. $0.12 per minute of audio.",
        docsUrl: "https://developers.heygen.com/docs/voices/speech-to-speech",
        categories: ["speech", "audio"],
        notes: [
            "HeyGen documents speech-to-speech for ACTIVE instant voices; " +
            "professional clones answer 400.",
            "Conversion can take up to 150 seconds; 504 means it may still " +
            "be running upstream.",
            "The hold prices the 5-minute maximum, since a URL's length is " +
            "unknown before conversion; the bill is the returned duration.",
        ],
    },
    endpoint: "/speech-to-speech",
    request: { method: "POST", path: "/v3/models/audio/sts" },
    timeouts: { requestMs: 170_000 },
    input: {
        schema: {
            body: z.object({
                voice_id: z.string().min(1).describe(
                    "An ACTIVE instant voice you cloned with /voices/clone.",
                ),
                audio: zUrlMedia(
                    "recording to convert, up to 300 seconds and 32 MB " +
                        "(WAV, MP3, FLAC, OGG, M4A, AAC); it must download " +
                        "within 60 seconds",
                ),
                remove_background_noise: z.boolean().describe(
                    "Clean the recording first (adds latency). HeyGen " +
                        "defaults to false.",
                ).optional(),
                seed: z.number().int().min(0).max(4294967295).describe(
                    "Best-effort repeatable generation.",
                ).optional(),
            }).strict(),
        },
    },
    resources: { reads: [{ id: "heygen/voice" }] },
    usage: {
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.SECOND,
            consumes: { credit: "default", amount: 0.002 },
            label: "seconds of audio",
            description: "$0.12 per minute of audio",
        },
        estimate: () => ({ counts: { SECOND: 300 } }),
        evidence: ({ data, utils }) => ({
            counts: {
                SECOND: Math.ceil(
                    utils.json.optionalNum(data.output, "$.data.duration") ??
                        0,
                ),
            },
        }),
    },
    lifecycle: { start: voiceGateStart },
});
