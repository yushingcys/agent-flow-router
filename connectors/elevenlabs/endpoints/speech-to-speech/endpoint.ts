import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zAudioQuery, zOutputFormat } from "../../schema/audio.ts";
import { zStsBody, zStsPathParams } from "./schema/inputs.ts";

/**
 * Voice changer - a multipart upload answered with raw audio, so a
 * lifecycle relay that sends `bodyEncoding: "multipart"`. $0.12 per minute,
 * folded per second and measured on the returned audio (same length as the
 * input) at the pinned `output_format`.
 */
export default defineEndpoint({
    meta: {
        displayName: "ElevenLabs Voice Changer",
        summary: "Re-voice a recording while keeping its delivery.",
        description: "Transform speech in `audio` into another ElevenLabs " +
            "voice while preserving the original emotion, timing, accent " +
            "and delivery - re-voice a narration, keep a performance and " +
            "swap the speaker. Pass the recording as {base64, contentType, " +
            "filename}; optionally `remove_background_noise` first. Returns " +
            "`audio_base64` (MP3 by default). $0.12 per minute of audio, " +
            "billed per second.",
        docsUrl: "https://elevenlabs.io/docs/api-reference/speech-to-speech/" +
            "convert",
        categories: ["speech", "audio"],
        notes: [
            "The estimate assumes compressed audio at 32 kbps from the " +
            "upload's size and settles on the audio returned.",
        ],
    },
    endpoint: "/v1/speech-to-speech",
    request: { method: "POST", path: "/v1/speech-to-speech/{voice_id}" },
    input: {
        schema: {
            pathParams: zStsPathParams,
            queryParams: zAudioQuery.extend({
                output_format: zOutputFormat.default("mp3_44100_128"),
            }),
            body: zStsBody,
        },
    },
    lifecycle: {
        start: async ({ utils }) => {
            const res = await utils.request({ bodyEncoding: "multipart" });
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
            description: "$0.12 per minute of audio",
        },
        estimate: ({ data }) => {
            const file = data.input.body.audio;
            const bytes = Math.floor(file.base64.length * 3 / 4);
            const raw = /wav|pcm/.test(file.contentType ?? "");
            return {
                counts: { SECOND: Math.ceil(bytes / (raw ? 32000 : 4000)) },
            };
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
