import { defineEndpoint, Unit, UsageModelKind } from "@shared/core";
import { zTtsBinding } from "../../schema/tts.ts";

/**
 * POST /v1/tts - raw audio back (engine 0.6.0 decodes it to
 * `{contentType, base64}`). A lifecycle `start` moves the `model` body field
 * into the vendor's `model` header.
 *
 * BILLED PER UTF-8 BYTE of `text`, the vendor's own measure: $15 per
 * million ($50 on drama-3), two composite lines routed by model. The core
 * has no BYTE unit, so the lines count bytes under CHARACTER - for ASCII
 * text the two are the same number.
 */
export default defineEndpoint({
    meta: {
        displayName: "Fish Audio Text to Speech",
        summary: "Convert text to natural speech with a library or cloned " +
            "voice.",
        description: "Speak text with any Fish Audio voice - pick one of " +
            "2M+ library voices or your own clone by `reference_id`, or " +
            "pass several ids with <|speaker:N|> tags for a multi-speaker " +
            "dialogue on the S2 and drama-3 models. Control expressiveness " +
            "(`temperature`, `top_p`), speed and volume (`prosody`), and " +
            "the output `format` (MP3 by default, WAV, PCM or Opus). " +
            "Returns `audio_base64`. $15 per million UTF-8 bytes of text " +
            "($0.015 per 1K), $50 on drama-3.",
        docsUrl: "https://docs.fish.audio/api-reference/endpoint/openapi-v1/" +
            "text-to-speech",
        categories: ["speech"],
        notes: [
            "Omitting reference_id speaks in a random voice.",
            "Inline reference clips (zero-shot cloning) are not exposed - " +
            "clone the voice with fishaudio#voices/clone and pass its id.",
        ],
    },
    endpoint: "/text-to-speech",
    request: { method: "POST", path: "/v1/tts" },
    input: { schema: { body: zTtsBinding } },
    lifecycle: {
        start: async ({ data, utils }) => {
            const { model, ...body } = data.input.body;
            const res = await utils.request({
                headers: { model },
                body: JSON.parse(JSON.stringify(body)),
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
            kind: UsageModelKind.COMPOSITE,
            components: {
                text_byte: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.CHARACTER,
                    consumes: { credit: "default", amount: 0.000015 },
                    label: "text bytes",
                    description: "$15 per million UTF-8 bytes of text " +
                        "(s2.1-pro, s2-pro, s1)",
                },
                drama_text_byte: {
                    kind: UsageModelKind.PER_UNIT,
                    unit: Unit.CHARACTER,
                    consumes: { credit: "default", amount: 0.00005 },
                    label: "drama-3 text bytes",
                    description: "$50 per million UTF-8 bytes of text on " +
                        "drama-3",
                },
            },
        },
        estimate: ({ data }) => {
            let bytes = 0;
            for (const ch of data.input.body.text) {
                const cp = ch.codePointAt(0) ?? 0;
                bytes += cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
            }
            return {
                counts: data.input.body.model === "drama-3"
                    ? { drama_text_byte: bytes }
                    : { text_byte: bytes },
            };
        },
        evidence: ({ data }) => {
            let bytes = 0;
            for (const ch of data.input.body.text) {
                const cp = ch.codePointAt(0) ?? 0;
                bytes += cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
            }
            return {
                counts: data.input.body.model === "drama-3"
                    ? { drama_text_byte: bytes }
                    : { text_byte: bytes },
            };
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
