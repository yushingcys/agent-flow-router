import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zAudioQuery, zOutputFormat } from "../../schema/audio.ts";
import { zSoundBody } from "./schema/inputs.ts";

/**
 * Sound effects - the vendor answers with raw audio, so this is a lifecycle
 * relay (engine 0.6.0 decodes the bytes to `{contentType, base64}`).
 *
 * $0.12 per minute of generated audio, folded per second. ElevenLabs reports
 * no duration, so evidence measures the returned audio: its byte length at
 * the requested `output_format` (pinned to MP3 128 kbps at the binding, so
 * the measure always has a known bitrate).
 */
export default defineEndpoint({
    meta: {
        displayName: "ElevenLabs Sound Effects",
        summary: "Generate a sound effect from a text description.",
        description: "Describe a sound - cinematic hits, Foley, ambience, " +
            "UI blips, short musical stingers - and get it back as audio " +
            "(`audio_base64`, MP3 by default). Set `duration_seconds` " +
            "(0.5-30) or let the model choose, `loop` for a seamless loop, " +
            "and `prompt_influence` for how literally to follow the prompt. " +
            "$0.12 per minute of generated audio, billed per second.",
        docsUrl: "https://elevenlabs.io/docs/api-reference/text-to-sound-" +
            "effects/convert",
        categories: ["audio"],
        notes: [
            "Without `duration_seconds` the estimate holds the 30 s maximum " +
            "and settles on the audio actually returned.",
        ],
    },
    request: { method: "POST", path: "/v1/sound-generation" },
    input: {
        schema: {
            queryParams: zAudioQuery.extend({
                output_format: zOutputFormat.default("mp3_44100_128"),
            }),
            body: zSoundBody,
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
            consumes: { credit: "default", amount: 0.002 },
            label: "seconds of audio",
            description: "$0.12 per minute of generated audio",
        },
        estimate: ({ data }) => ({
            counts: {
                SECOND: Math.ceil(data.input.body.duration_seconds ?? 30),
            },
        }),
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
