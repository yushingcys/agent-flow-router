import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zIsolationBody } from "./schema/inputs.ts";

/**
 * Voice isolator - multipart upload, raw MP3 back. $0.12 per minute, folded
 * per second. The vendor takes no `output_format` here and answers
 * `audio/mpeg`; evidence measures the returned MP3 at 128 kbps.
 */
export default defineEndpoint({
    meta: {
        displayName: "ElevenLabs Voice Isolator",
        summary: "Remove background noise and music from speech.",
        description: "Strip background noise, music, reverb and ambient " +
            "sound from a recording and get back clean, studio-quality " +
            "speech (`audio_base64`, MP3). Pass the recording as {base64, " +
            "contentType, filename}; WAV, MP3, FLAC, OGG and AAC up to 500 " +
            "MB or 1 hour. $0.12 per minute of audio, billed per second.",
        docsUrl: "https://elevenlabs.io/docs/api-reference/audio-isolation/" +
            "convert",
        categories: ["audio"],
        notes: [
            "The estimate assumes compressed audio at 32 kbps from the " +
            "upload's size and settles on the audio returned.",
        ],
    },
    request: { method: "POST", path: "/v1/audio-isolation" },
    input: { schema: { body: zIsolationBody } },
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
        // ponytail: assumes the vendor's 128 kbps MP3; read the frame
        // header if ElevenLabs ever varies the isolator's bitrate.
        evidence: ({ data, utils }) => {
            const b64 = utils.json.optionalGet(data.output, "$.base64");
            if (typeof b64 !== "string") return { counts: { SECOND: 0 } };
            const bytes = Math.floor(b64.length * 3 / 4) -
                (b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0);
            return { counts: { SECOND: Math.ceil(bytes / 16000) } };
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
