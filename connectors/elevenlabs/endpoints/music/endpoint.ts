import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zAudioQuery, zOutputFormat } from "../../schema/audio.ts";
import { zMusicBody } from "./schema/inputs.ts";

/**
 * Eleven Music - raw audio back, so a lifecycle relay like sound effects.
 * $0.15 per minute, folded per second and measured on the returned audio.
 * `output_format` is pinned to MP3 128 kbps at the binding: the vendor's
 * own default, `auto`, has no bitrate to measure the audio by.
 */
export default defineEndpoint({
    meta: {
        displayName: "ElevenLabs Music Generation",
        summary: "Generate a full song or instrumental from a text prompt.",
        description: "Compose studio-grade music with Eleven Music from a " +
            "natural-language `prompt` (genre, mood, instruments, vocals, " +
            "lyrics theme) or a section-by-section `composition_plan`, with " +
            "vocals in many languages or `force_instrumental`. Set " +
            "`music_length_ms` (3 s to 10 min) or let the model choose. " +
            "Returns `audio_base64` (MP3 by default). Cleared for " +
            "commercial use. $0.15 per minute of generated audio, billed " +
            "per second.",
        docsUrl: "https://elevenlabs.io/docs/api-reference/music/compose",
        categories: ["music-generation"],
        notes: [
            "Without `music_length_ms` or a plan, the estimate holds 5 " +
            "minutes and settles on the audio actually returned.",
            "Generation blocks until the song is rendered, often a minute " +
            "or more for long tracks.",
        ],
    },
    request: { method: "POST", path: "/v1/music" },
    input: {
        schema: {
            queryParams: zAudioQuery.extend({
                output_format: zOutputFormat.default("mp3_44100_128"),
            }),
            body: zMusicBody,
        },
    },
    lifecycle: {
        start: async ({ utils }) => {
            const res = await utils.request();
            return {
                kind: "COMPLETED",
                httpStatus: res.status,
                output: res.body,
            };
        },
    },
    usage: {
        model: {
            kind: UsageModelKind.PER_UNIT,
            unit: Unit.SECOND,
            consumes: { credit: "default", amount: 0.0025 },
            label: "seconds of music",
            description: "$0.15 per minute of generated audio",
        },
        estimate: ({ data }) => {
            const body = data.input.body;
            const planned = body.composition_plan?.sections.reduce(
                (sum, section) => sum + section.duration_ms,
                0,
            );
            const ms = body.music_length_ms ?? planned ?? 300000;
            return { counts: { SECOND: Math.ceil(ms / 1000) } };
        },
        evidence: ({ data, utils }) => {
            const b64 = utils.json.optionalGet(data.output, "$.base64");
            if (typeof b64 !== "string") return { counts: { SECOND: 0 } };
            const bytes = Math.floor(b64.length * 3 / 4) -
                (b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0);
            const [codec, rate, kbps] = data.input.queryParams.output_format
                .split("_");
            const seconds = codec === "mp3" || codec === "opus"
                ? bytes * 8 / (Number(kbps) * 1000)
                : codec === "pcm"
                ? bytes / (Number(rate) * 2)
                : bytes / Number(rate);
            return { counts: { SECOND: Math.ceil(seconds) } };
        },
    },
    output: {
        /** Raw audio becomes `{audio_base64, content_type}`; anything
         *  else a 2xx carries passes through untouched. */
        fromResponse: ({ data, utils }) => {
            const audio = utils.json.optionalGet(data.output, "$.base64");
            return typeof audio === "string"
                ? {
                    audio_base64: audio,
                    content_type: utils.json.get(data.output, "$.contentType"),
                }
                : data.output;
        },
    },
});
