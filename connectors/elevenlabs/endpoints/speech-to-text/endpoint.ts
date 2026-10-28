import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zSttBody } from "./schema/inputs.ts";

/**
 * Scribe transcription - a multipart upload (the file, or `source_url` for
 * the vendor to fetch), JSON back, so a lifecycle relay with
 * `bodyEncoding: "multipart"`.
 *
 * BILLING: $0.22 per audio hour, plus $0.05 with `keyterms` and $0.07 with
 * `transcript_edit`, as three per-second lines settled on the vendor's
 * `audio_duration_secs`. A URL's length is unknowable up front, so its
 * estimate holds one hour.
 */
export default defineEndpoint({
    meta: {
        displayName: "ElevenLabs Speech to Text",
        summary: "Transcribe audio or video with ElevenLabs Scribe.",
        description: "Transcribe a recording in 90+ languages with " +
            "ElevenLabs Scribe - pass the file as {base64, contentType, " +
            "filename} or a `source_url` (hosted media, YouTube, TikTok). " +
            "Returns the `text`, word-level `words` with start/end times " +
            "and `speaker_id` when `diarize` is on, `language_code`, " +
            "audio-event tags like (laughter), and optional entity " +
            "detection or redaction. Bias recognition with `keyterms`; " +
            "rewrite the result with `transcript_edit`. $0.22 per audio " +
            "hour, +$0.05 with keyterms, +$0.07 with transcript editing.",
        docsUrl: "https://elevenlabs.io/docs/api-reference/speech-to-text/" +
            "convert",
        categories: ["speech"],
        notes: [
            "Pass exactly one of `file` or `source_url`; ElevenLabs " +
            "rejects both or neither (unbilled).",
            "The estimate holds one hour for a `source_url`, and the " +
            "upload's size at 32 kbps for a file; the run settles on " +
            "ElevenLabs' reported duration.",
        ],
    },
    request: { method: "POST", path: "/v1/speech-to-text" },
    input: { schema: { body: zSttBody } },
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
            kind: UsageModelKind.COMPOSITE,
            components: {
                audio_second: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.SECOND,
                    consumes: { credit: "default", amount: 0.22 / 3600 },
                    label: "audio",
                    description: "$0.22 per audio hour",
                },
                keyterm_second: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.SECOND,
                    consumes: { credit: "default", amount: 0.05 / 3600 },
                    label: "keyterm prompting",
                    description: "+$0.05 per audio hour with keyterms",
                },
                edit_second: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.SECOND,
                    consumes: { credit: "default", amount: 0.07 / 3600 },
                    label: "transcript editing",
                    description: "+$0.07 per audio hour with transcript_edit",
                },
            },
        },
        estimate: ({ data }) => {
            const body = data.input.body;
            const file = body.file;
            const seconds = file === undefined ? 3600 : Math.ceil(
                Math.floor(file.base64.length * 3 / 4) /
                    (/wav|pcm/.test(file.contentType ?? "") ? 32000 : 4000),
            );
            return {
                counts: {
                    audio_second: seconds,
                    ...((body.keyterms?.length ?? 0) > 0
                        ? { keyterm_second: seconds }
                        : {}),
                    ...(body.transcript_edit ? { edit_second: seconds } : {}),
                },
            };
        },
        /** Multichannel answers carry `audio_duration_secs` per channel
         *  under `transcripts`; the first channel's is the file's. */
        evidence: ({ data, utils }) => {
            const body = data.input.body;
            const raw = utils.json.optionalNum(
                data.output,
                "$.audio_duration_secs",
            ) ?? utils.json.optionalNum(
                data.output,
                "$.transcripts[0].audio_duration_secs",
            ) ?? 0;
            const seconds = Math.ceil(raw);
            return {
                counts: {
                    audio_second: seconds,
                    ...((body.keyterms?.length ?? 0) > 0
                        ? { keyterm_second: seconds }
                        : {}),
                    ...(body.transcript_edit ? { edit_second: seconds } : {}),
                },
            };
        },
    },
});
