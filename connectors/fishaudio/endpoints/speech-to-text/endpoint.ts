import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zAsrBody } from "./schema/inputs.ts";

/**
 * POST /v1/asr - multipart upload with the model in a header: `start`
 * moves `model` into the header and sends the rest multipart.
 *
 * $0.36 per audio hour, rounded up to the second - the vendor's own rule -
 * settled on the response's `duration`.
 */
export default defineEndpoint({
    meta: {
        displayName: "Fish Audio Transcribe Audio",
        summary: "Transcribe a recording into text with speaker labels.",
        description: "Transcribe an audio or video recording, passed as " +
            "{base64, contentType, filename}. Returns the `text`, timed " +
            "`segments`, the `duration` in seconds and the detected " +
            "`language_code`; transcribe-1-pro adds speaker turns and " +
            "inline emotion cues for multi-speaker recordings. $0.36 per " +
            "audio hour, billed per second.",
        docsUrl: "https://docs.fish.audio/api-reference/endpoint/openapi-v1/" +
            "speech-to-text",
        categories: ["speech"],
        notes: [
            "The estimate assumes compressed audio at 32 kbps from the " +
            "upload's size; the run settles on Fish Audio's reported " +
            "duration.",
        ],
    },
    endpoint: "/speech-to-text",
    request: { method: "POST", path: "/v1/asr" },
    input: {
        schema: {
            body: zAsrBody.extend({
                model: zAsrBody.shape.model.unwrap().default(
                    "transcribe-1-pro",
                ),
            }),
        },
    },
    lifecycle: {
        start: async ({ data, utils }) => {
            const { model, ...body } = data.input.body;
            const res = await utils.request({
                headers: { model },
                body: JSON.parse(JSON.stringify(body)),
                bodyEncoding: "multipart",
            });
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
            consumes: { credit: "default", amount: 0.0001 },
            label: "seconds of audio",
            description: "$0.36 per audio hour",
        },
        estimate: ({ data }) => {
            const file = data.input.body.audio;
            const bytes = Math.floor(file.base64.length * 3 / 4);
            const raw = /wav|pcm/.test(file.contentType ?? "");
            return {
                counts: { SECOND: Math.ceil(bytes / (raw ? 32000 : 4000)) },
            };
        },
        evidence: ({ data, utils }) => ({
            counts: {
                SECOND: Math.ceil(
                    utils.json.optionalNum(data.output, "$.duration") ?? 0,
                ),
            },
        }),
    },
});
